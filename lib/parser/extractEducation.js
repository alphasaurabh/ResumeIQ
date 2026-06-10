import cleanArtifacts from "./cleanArtifacts";

const DEGREE_WHITELIST = [
	"B.Tech",
	"M.Tech",
	"B.E",
	"Bachelor of Technology",
	"Bachelor of Engineering",
	"MBA",
	"BCA",
	"MCA",
	"BSc",
	"MSc",
	"High School",
	"Intermediate",
];

const DEGREE_MATCHERS = [
	{ degree: "B.Tech", pattern: /\bb\.?\s*tech\b/i },
	{ degree: "M.Tech", pattern: /\bm\.?\s*tech\b/i },
	{ degree: "B.E", pattern: /\bb\.?\s*e\.?\b/i },
	{ degree: "Bachelor of Technology", pattern: /\bbachelor\s+of\s+technology\b/i },
	{ degree: "Bachelor of Engineering", pattern: /\bbachelor\s+of\s+engineering\b/i },
	{ degree: "MBA", pattern: /\bm\.?\s*b\.?\s*a\.?\b/i },
	{ degree: "BCA", pattern: /\bb\.?\s*c\.?\s*a\.?\b/i },
	{ degree: "MCA", pattern: /\bm\.?\s*c\.?\s*a\.?\b/i },
	{ degree: "BSc", pattern: /\bb\.?\s*sc\.?\b/i },
	{ degree: "MSc", pattern: /\bm\.?\s*sc\.?\b/i },
	{ degree: "High School", pattern: /\bhigh\s+school\b/i },
	{ degree: "Intermediate", pattern: /\bintermediate\b/i },
];

const MONTH_PATTERN = "(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\\.?";

const extractDurationFromText = (text) => {
	const durationPatterns = [
		new RegExp(`(${MONTH_PATTERN}\\s+\\d{4})\\s*[-–]\\s*(${MONTH_PATTERN}\\s+\\d{4}|present|current|ongoing)`, "i"),
		/(\d{4})\s*[-–]\s*(\d{4}|present|current|ongoing)/i,
	];

	for (const pattern of durationPatterns) {
		const match = text.match(pattern);
		if (match) {
			return match[0].trim().replace(/\s*[-–]\s*/g, " - ");
		}
	}

	return "";
};

const extractDegreeFromText = (text) => {
	for (const { degree, pattern } of DEGREE_MATCHERS) {
		if (pattern.test(text)) {
			return degree;
		}
	}

	return "";
};

const extractScoreFromText = (text) => {
	let match = text.match(/\b(CGPA|SGPA|GPA)\b\s*[:=-]?\s*(\d+(?:\.\d+)?(?:\s*\/\s*\d+(?:\.\d+)?)?)/i);
	if (match) {
		const label = match[1].toUpperCase();
		const value = match[2].replace(/\s+/g, "");
		return `${label} ${value}`;
	}

	match = text.match(/(\d+(?:\.\d+)?)\s*(%|percent(?:age)?)/i);
	if (match) {
		return `${match[1]}%`;
	}

	match = text.match(/\bpercentage\b\s*[:=-]?\s*(\d+(?:\.\d+)?)\s*%?/i);
	if (match) {
		return `${match[1]}%`;
	}

	return "";
};

const looksLikeInstitution = (text) => {
	if (!text || text.length < 3 || text.length > 100) {
		return false;
	}

	const universityKeywords = [
		"university",
		"college",
		"institute",
		"school",
		"academy",
		"polytechnic",
	];
	const lower = text.toLowerCase();

	return universityKeywords.some((keyword) => lower.includes(keyword));
};

export function extractEducation(educationText = "") {
	if (!educationText) {
		return [];
	}

	const lines = educationText
		.split("\n")
		.map((line) => line.trim())
		.filter(Boolean);

	const educationEntries = [];
	let currentEntry = null;

	for (const line of lines) {
		const cleaned = cleanArtifacts(line);
		if (!cleaned) {
			continue;
		}

		if (looksLikeInstitution(cleaned)) {
			if (currentEntry && currentEntry.institution) {
				educationEntries.push(currentEntry);
			}

			currentEntry = {
				institution: cleaned,
				degree: "",
				duration: "",
				score: "",
			};
			continue;
		}

		if (!currentEntry) {
			currentEntry = {
				institution: "",
				degree: "",
				duration: "",
				score: "",
			};
		}

		const degree = extractDegreeFromText(cleaned);
		if (degree && !currentEntry.degree) {
			currentEntry.degree = degree;
		}

		const duration = extractDurationFromText(cleaned);
		if (duration && !currentEntry.duration) {
			currentEntry.duration = duration;
		}

		const score = extractScoreFromText(cleaned);
		if (score && !currentEntry.score) {
			currentEntry.score = score;
		}

		if (
			!currentEntry.institution &&
			!degree &&
			!duration &&
			!score
		) {
			currentEntry.institution = cleaned;
		}
	}

	if (currentEntry && currentEntry.institution) {
		educationEntries.push(currentEntry);
	}

	return educationEntries
		.map((entry) => ({
			institution: entry.institution || "",
			degree: DEGREE_WHITELIST.includes(entry.degree) ? entry.degree : "",
			duration: entry.duration || "",
			score: entry.score || "",
		}))
		.filter((entry) => entry.institution || entry.degree || entry.duration || entry.score);
}

export default extractEducation;
