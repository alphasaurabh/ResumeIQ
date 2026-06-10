
const ACTION_VERBS = [
	"built",
	"developed",
	"designed",
	"implemented",
	"optimized",
	"collaborated",
	"created",
	"led",
	"managed",
	"improved",
	"enhanced",
	"deployed",
	"selected",
	"handled",
	"maintained",
	"supported",
	"worked",
	"performed",
	"executed"
];

const DATE_PATTERN = /\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)\.?\s+\d{4}/gi;
const DURATION_PATTERN =
	/((?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)\.?\s+\d{4})\s*(?:-|–|to)?\s*((?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)\.?\s+\d{4}|present|current|ongoing)/i;
const COMPANY_INDICATORS = [
	"company",
	"employer",
	"organization",
	"corporation",
	"pvt",
	"ltd",
	"inc",
	"co",
	"llc",
];


const LOCATION_PATTERN = /(?:location|based in|at|office|headquartered|located)\s*[:,-]?\s*([^,\n]+(?:,\s*[^,\n]+)?)/i;

const looksLikeRole = (line) => {
	if (!line || line.length < 3 || line.length > 120) {
		return false;
	}
	console.log("ROLE CHECK:", line);
	console.log(line.length);
	// Has action verb at start
	const startsWithActionVerb = ACTION_VERBS.some((verb) =>
		new RegExp(`^${verb}`, "i").test(line)
	);
	if (startsWithActionVerb) {
		return false;
	}
	const withoutDates = line
		.replace(DATE_PATTERN, "")
		.trim();

	line = withoutDates;
	// Looks like a job title - no bullet points, moderate length
	const hasBullet = /^[-*•\u2022]/.test(line);
	if (hasBullet) {
		return false;
	}

	// Common role keywords
	const roleKeywords = ["engineer", "developer", "designer", "manager", "analyst", "consultant", "intern", "trainee", "associate", "specialist", "lead"];
	const hasRoleKeyword = roleKeywords.some((keyword) =>
		line.toLowerCase().includes(keyword)
	);

	return hasRoleKeyword;
};

const looksLikeCompany = (line) => {
	if (!line || line.length < 2 || line.length > 100) {
		return false;
	}

	// Typically capitalized, may contain ltd/inc/pvt
	if (!/[A-Z]/.test(line)) {
		return false;
	}

	// Has company suffix or common indicators
	const hasIndicator = COMPANY_INDICATORS.some((indicator) =>
		line.toLowerCase().includes(indicator)
	);

	// All caps or title case, no action verbs, no bullets
	const hasBullet = /^[-*•\u2022]/.test(line);
	const hasActionVerb = ACTION_VERBS.some((verb) =>
		new RegExp(`\\b${verb}\\b`, "i").test(line)
	);

	const words = line.split(/\s+/);

	const titleCaseWords = words.filter(
		word => /^[A-Z][A-Za-z&.-]*$/.test(word)
	);

	return (
		hasIndicator ||
		(
			words.length <= 8 &&
			titleCaseWords.length >=
			Math.ceil(words.length * 0.7)
		)
	);
};

const looksLikeLocation = (line) => {
	if (!line || line.length < 2 || line.length > 80) {
		return false;
	}

	const lower = line.toLowerCase();

	// Has city, country, state patterns or explicit location keyword
	const hasLocationKeyword = /(?:location|based|office|headquarters|city|state|country|at\s+)/.test(lower);
	const hasCityPattern = /^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:,\s*[A-Z]{2})?(?:,\s*[A-Za-z]+)?$/.test(line);

	return hasLocationKeyword || hasCityPattern;
};

const extractDuration = (text) => {
	const match = text.match(DURATION_PATTERN);
	return match ? match[0] : "";
};

const extractDescriptionBullets = (lines) => {
	const bullets = [];

	for (const line of lines) {
		const trimmed = line.trim();
		if (!trimmed) {
			continue;
		}

		// Line that starts with bullet or action verb is part of description
		const hasBullet = /^[-*•\u2022]/.test(trimmed);
		const hasActionVerb = ACTION_VERBS.some((verb) =>
			new RegExp(`^${verb}\\b`, "i").test(trimmed)
		);

		if (hasBullet || hasActionVerb) {
			// Remove leading bullet if present
			const cleanedLine = trimmed.replace(/^[-*•\u2022]\s*/, "").trim();
			if (cleanedLine) {
				bullets.push(cleanedLine);
			}
		}
	}

	return bullets;
};

const normalizeLocation = (location) => {
	if (!location) {
		return "";
	}

	const trimmed = location.trim();

	// Remove location keyword prefix
	let cleaned = trimmed
		.replace(/^(?:location|based in|at|office|headquarters)\s*[:,-]?\s*/i, "")
		.trim();

	// Add country suffix if not present and looks like Indian city
	const indianCities = ["bangalore", "delhi", "mumbai", "hyderabad", "pune", "chelambakam", "new delhi"];
	const isIndianCity = indianCities.some((city) =>
		cleaned.toLowerCase().includes(city)
	);

	if (isIndianCity && !cleaned.toLowerCase().includes("india")) {
		cleaned = `${cleaned}, India`;
	}

	return cleaned;
};

export function extractExperience(experienceText = "") {
	if (!experienceText) {
		return [];
	}

	const lines = experienceText
		.split("\n")
		.map((line) => line.replace(/^[-*•\u2022\d.)\s]+/, "").trim())
		.filter(Boolean);

	const experiences = [];
	let currentExperience = null;
	let entryLines = [];

	for (const line of lines) {

		console.log("\n----------------");
		console.log("LINE:", line);
		console.log("ROLE?", looksLikeRole(line));
		console.log("COMPANY?", looksLikeCompany(line));
		console.log("LOCATION?", looksLikeLocation(line));
		console.log("DURATION?", extractDuration(line));
		console.log("MATCHED DURATION:", extractDuration(line));

		// Try to detect a new experience entry
		if (looksLikeRole(line)) {
			// Save previous entry if exists
			if (currentExperience && entryLines.length > 0) {
				currentExperience.description = extractDescriptionBullets(entryLines);
				experiences.push(currentExperience);
			}

			// Start new entry
			currentExperience = {
				role: line.replace(DATE_PATTERN, "").trim(),
				company: "",
				location: "",
				duration: "",
				description: [],
			};
			entryLines = [];
			continue;
		}

		// Add line to current entry
		if (!currentExperience) {
			// No role detected yet, treat as potential company/location/duration
			if (looksLikeCompany(line)) {
				if (!currentExperience) {
					currentExperience = {
						role: "",
						company: line,
						location: "",
						duration: "",
						description: [],
					};
				} else {
					currentExperience.company = line;
				}
			} else if (looksLikeLocation(line)) {
				if (!currentExperience) {
					currentExperience = {
						role: "",
						company: "",
						location: normalizeLocation(line),
						duration: "",
						description: [],
					};
				} else {
					currentExperience.location = normalizeLocation(line);
				}
			} else {
				entryLines.push(line);
			}
			continue;
		}

		// If role is set, extract company/location/duration
		if (
			currentExperience.role &&
			!currentExperience.company &&
			looksLikeCompany(line)
		) {
			currentExperience.company = line;
			continue;
		}

		if (currentExperience.role && !currentExperience.location && looksLikeLocation(line)) {
			currentExperience.location = normalizeLocation(line);
			continue;
		}

		if (!currentExperience.duration) {
			const duration = extractDuration(line);
			if (duration) {
				currentExperience.duration = duration;
				continue;
			}
		}

		// Otherwise add to description lines
		entryLines.push(line);
	}

	// Save last entry
	if (currentExperience) {
		if (entryLines.length > 0) {
			currentExperience.description = extractDescriptionBullets(entryLines);
		}
		experiences.push(currentExperience);
	}

	// Filter out empty entries
	return experiences.filter(
		(exp) => exp.role || exp.company || exp.duration || exp.description.length > 0
	);
}

export default extractExperience;
