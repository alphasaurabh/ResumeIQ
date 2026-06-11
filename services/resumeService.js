import mammoth from "mammoth";
import nlp from "compromise";
import natural from "natural";
//import extractPdfText from "../lib/pdf/extractPdfText";
import cleanResumeText from "../lib/parser/cleanResumeText";
import extractSections from "../lib/parser/extractSections";
import extractSkills from "../lib/parser/extractSkills";
import extractProjects from "../lib/parser/extractProjects";
import extractEducation from "../lib/parser/extractEducation";
import extractExperience from "../lib/parser/extractExperience";
import calculateParseScore from "../lib/parser/metrics/calculateParseScore";
import scoreResume from "../lib/ats/atsScorer";

const sentenceTokenizer = new natural.SentenceTokenizer();

const EMAIL_REGEX = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
const DENY_LIST = [
	"react.js",
	"next.js",
	"node.js",
	"express.js",
	"b.tech",
	"m.tech",
	"vue.js",
	"angular.js",
	"svelte.js",
	"gatsby.js",
	"nuxt.js",
	"remix.js",
	"solid.js",
];

const VALID_TLDS = [".com", ".in", ".dev", ".io", ".net", ".org", ".co", ".app"];

const isValidUrl = (link) => {
	if (!link || typeof link !== "string") {
		return false;
	}

	const lower = link.toLowerCase().trim();

	// Check deny list
	if (DENY_LIST.some((denied) => lower.includes(denied))) {
		return false;
	}

	// Must start with http/https or www or valid domain
	if (lower.startsWith("http://") || lower.startsWith("https://")) {
		try {
			new URL(lower);
			return true;
		} catch {
			return false;
		}
	}

	if (lower.startsWith("www.")) {
		return true;
	}

	// Check if it's a domain with valid TLD
	const hasTld = VALID_TLDS.some((tld) => lower.includes(tld));
	if (!hasTld) {
		return false;
	}

	// Reject if it looks like a tech name or degree
	if (lower.endsWith(".js") || lower.endsWith(".tech")) {
		return false;
	}

	// Only accept if it looks like a proper domain
	// Must have domain pattern before TLD
	const domainPattern = /^[a-z0-9-]+(\.[a-z0-9-]+)*\.(com|in|dev|io|net|org|co|app)(\/[^\s]*)?$/i;
	return domainPattern.test(lower);
};

const toBuffer = (input) => {
	if (Buffer.isBuffer(input)) {
		return input;
	}

	if (input instanceof Uint8Array) {
		return Buffer.from(input);
	}

	if (input instanceof ArrayBuffer) {
		return Buffer.from(input);
	}

	throw new Error("Unsupported buffer input.");
};

const normalizeInputFile = async (inputFile) => {
	if (!inputFile) {
		throw new Error("No resume file provided.");
	}

	if (inputFile?.arrayBuffer && typeof inputFile.arrayBuffer === "function") {
		const raw = await inputFile.arrayBuffer();
		return {
			buffer: Buffer.from(raw),
			fileName: inputFile.name || "",
			mimeType: inputFile.type || "",
		};
	}

	if (inputFile?.buffer) {
		return {
			buffer: toBuffer(inputFile.buffer),
			fileName: inputFile.fileName || inputFile.name || "",
			mimeType: inputFile.mimeType || inputFile.type || "",
		};
	}

	if (
		Buffer.isBuffer(inputFile) ||
		inputFile instanceof Uint8Array ||
		inputFile instanceof ArrayBuffer
	) {
		return {
			buffer: toBuffer(inputFile),
			fileName: "",
			mimeType: "",
		};
	}

	throw new Error("Unsupported resume file format.");
};

const extractDocxText = async (buffer) => {
	const parsed = await mammoth.extractRawText({ buffer });
	return (parsed?.value || "").trim();
};

const extractTextByType = async ({ buffer, fileName, mimeType }) => {
	const lowerName = (fileName || "").toLowerCase();
	const lowerMime = (mimeType || "").toLowerCase();

	const isPdf = lowerMime.includes("pdf") || lowerName.endsWith(".pdf");
	const isDocx =
		lowerMime.includes("wordprocessingml.document") || lowerName.endsWith(".docx");

	if (isPdf) {
		return "PDF TEST";
	}

	if (isDocx) {
		return extractDocxText(buffer);
	}

	throw new Error("Only PDF and DOCX files are supported.");
};

const normalizeLink = (link) => {
	if (!link || typeof link !== "string") {
		return "";
	}

	const lower = link.trim().toLowerCase();

	// Reject email-like strings
	if (lower.includes("@")) {
		return "";
	}

	// Already has protocol
	if (lower.startsWith("http://") || lower.startsWith("https://")) {
		return isValidUrl(link) ? link : "";
	}

	// Has www or common domain pattern
	if (lower.startsWith("www.")) {
		return isValidUrl(link) ? `https://${link}` : "";
	}

	// Check if it's a valid domain to normalize
	if (isValidUrl(link)) {
		return `https://${link}`;
	}

	return "";
};

const extractLinks = (text) => {
	if (!text || typeof text !== "string") {
		return [];
	}

	const links = new Set();

	// Pattern to find URLs and domain-like strings
	const urlPattern = /(?:https?:\/\/|www\.)[^\s<>""'|]+|(?:^|\s)([a-z0-9][a-z0-9-]*(?:\.[a-z0-9][a-z0-9-]*)+)(?:\s|$)/gi;

	let match;
	while ((match = urlPattern.exec(text)) !== null) {
		const potential = match[0].trim();
		const normalized = normalizeLink(potential);

		if (normalized) {
			links.add(normalized);
		}
	}

	return Array.from(links);
};
const NAME_BLACKLIST = [
	"professional summary",
	"summary",
	"profile",
	"career objective",
	"objective",
	"about me",
	"work experience",
	"experience",
	"education",
	"skills",
	"projects",
	"certifications",
	"achievements",
	"contact",
	"resume",
	"curriculum vitae",
];

const looksLikeNameLine = (line) => {
	if (!line) return false;

	const cleaned = line
		.trim()
		.replace(/[|•▪■►★☆]+/g, "")
		.replace(/\s+/g, " ");

	if (cleaned.length < 3 || cleaned.length > 60) {
		return false;
	}

	if (
		/@|https?:\/\/|www\.|linkedin|github|portfolio/i.test(cleaned)
	) {
		return false;
	}

	const words = cleaned.split(" ").filter(Boolean);

	if (words.length < 2 || words.length > 5) {
		return false;
	}

	// reject lines with too many numbers
	const digitCount = (cleaned.match(/\d/g) || []).length;
	if (digitCount > 1) {
		return false;
	}
	const lower = cleaned.toLowerCase();

	if (
		NAME_BLACKLIST.some(item =>
			lower.includes(item)
		)
	) {
		return false;
	}

	// require most words to look name-like
	const validWords = words.filter((word) =>
		/^[A-Za-z][A-Za-z.'-]*$/.test(word)
	);

	return validWords.length >= Math.ceil(words.length * 0.8);

};

const extractName = (fullText, sections) => {
	const headerBlock = sections.header || fullText.split("\n").slice(0, 8).join("\n");
	const people = nlp(headerBlock).people().out("array");

	if (people.length > 0) {
		const candidate = people[0].trim();
		if (looksLikeNameLine(candidate)) {
			return candidate;
		}
	}

	const candidates = headerBlock
		.split("\n")
		.map((line) => line.trim())
		.filter((line) => looksLikeNameLine(line));

	if (candidates.length === 0) {
		return "";
	}

	candidates.sort((a, b) => {
		const aWords = a.split(" ").length;
		const bWords = b.split(" ").length;

		// Prefer 2–4 word names
		const aScore = Math.abs(3 - aWords);
		const bScore = Math.abs(3 - bWords);

		return aScore - bScore;
	});


	return candidates[0];
};

const splitSectionEntries = (sectionText = "") => {
	if (!sectionText) {
		return [];
	}

	const lines = sectionText
		.split("\n")
		.map((line) => line.replace(/^[-*•\u2022\d.)\s]+/, "").trim())
		.filter(Boolean);

	const entries = [];

	for (const line of lines) {
		const sentences = sentenceTokenizer.tokenize(line);
		if (sentences.length === 0) {
			continue;
		}

		entries.push(line);
	}

	return Array.from(new Set(entries));
};
export async function parseResumeFile(inputFile) {
	const file = await normalizeInputFile(inputFile);
	const extractedText = await extractTextByType(file);

	const cleanedText = cleanResumeText(extractedText);

	const sections = extractSections(cleanedText);

	const emailMatch = cleanedText.match(EMAIL_REGEX);

	const parsedData = {
		name: extractName(cleanedText, sections),
		email: emailMatch ? emailMatch[0] : "",
		links: extractLinks(cleanedText),

		skills: extractSkills(
			`${sections.skills}\n${cleanedText}`
		),

		projects: extractProjects(
			sections.projects
		),

		education: extractEducation(
			sections.education
		),

		experience: extractExperience(
			sections.experience
		),

		certifications: splitSectionEntries(
			sections.certifications
		),
	};
	console.log("\n========== SECTIONS ==========");
	console.log(sections);

	console.log("\n========== PROJECTS ==========");
	console.log(JSON.stringify(parsedData.projects, null, 2));

	console.log("\n========== EXPERIENCE ==========");
	console.log(JSON.stringify(parsedData.experience, null, 2));

	console.log("\n========== SKILLS ==========");
	console.log(parsedData.skills);

	console.log("=============================\n");

	const parseConfidence = calculateParseScore(parsedData);

	const ats = scoreResume(parsedData);

	return {
		...parsedData,
		parseConfidence,
		ats,
	};

}
