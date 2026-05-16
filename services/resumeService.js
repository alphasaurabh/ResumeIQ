import mammoth from "mammoth";
import nlp from "compromise";
import natural from "natural";
import extractPdfText from "../lib/pdf/extractPdfText";
import cleanResumeText from "../lib/parser/cleanResumeText";
import extractSections from "../lib/parser/extractSections";
import extractSkills from "../lib/parser/extractSkills";
import extractProjects from "../lib/parser/extractProjects";

const sentenceTokenizer = new natural.SentenceTokenizer();

const EMAIL_REGEX = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
const URL_REGEX = /\b((?:https?:\/\/)?(?:www\.)?[a-z0-9.-]+\.[a-z]{2,}(?:\/[\w\-./?%&=+#]*)?)\b/gi;

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
		return extractPdfText(buffer);
	}

	if (isDocx) {
		return extractDocxText(buffer);
	}

	throw new Error("Only PDF and DOCX files are supported.");
};

const normalizeLink = (link) => {
	if (!link || link.includes("@")) {
		return "";
	}

	if (/^https?:\/\//i.test(link)) {
		return link;
	}

	return `https://${link}`;
};

const extractLinks = (text) => {
	const links = new Set();

	let match = URL_REGEX.exec(text);
	while (match) {
		const normalized = normalizeLink(match[1]);
		if (normalized) {
			links.add(normalized);
		}

		match = URL_REGEX.exec(text);
	}

	return Array.from(links);
};

const looksLikeNameLine = (line) => {
	if (!line || line.length < 3 || line.length > 60) {
		return false;
	}

	if (/@|https?:\/\/|www\.|\d/.test(line)) {
		return false;
	}

	const words = line.split(/\s+/).filter(Boolean);
	if (words.length < 2 || words.length > 4) {
		return false;
	}

	return words.every((word) => /^[A-Z][A-Za-z'-.]+$/.test(word));
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

	const firstHeaderLine = headerBlock
		.split("\n")
		.map((line) => line.trim())
		.find((line) => looksLikeNameLine(line));

	return firstHeaderLine || "";
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

	return {
		name: extractName(cleanedText, sections),
		email: emailMatch ? emailMatch[0] : "",
		links: extractLinks(cleanedText),
		skills: extractSkills(`${sections.skills}\n${cleanedText}`),
		projects: extractProjects(sections.projects),
		education: splitSectionEntries(sections.education),
		experience: splitSectionEntries(sections.experience),
		certifications: splitSectionEntries(sections.certifications),
	};
}

export default parseResumeFile;
