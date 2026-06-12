
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
	"executed",
];

const ROLE_KEYWORDS = [
	"engineer",
	"developer",
	"designer",
	"manager",
	"analyst",
	"consultant",
	"intern",
	"trainee",
	"associate",
	"specialist",
	"lead",
];

const DATE_PATTERN =
	/\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)\.?\s+\d{4}/gi;

const DURATION_PATTERN =
	/((?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)\.?\s+\d{4})\s*(?:-|–|to)?\s*((?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)\.?\s+\d{4}|present|current|ongoing)/i;

const COMPANY_INDICATORS = [
	"company",
	"organization",
	"corporation",
	"pvt",
	"ltd",
	"inc",
	"co",
	"llc",
];

const looksLikeRole = (line) => {
	if (!line || line.length < 3 || line.length > 120) {
		return false;
	}

	const cleaned = line
		.replace(DATE_PATTERN, "")
		.trim()
		.toLowerCase();

	if (/^[-*•\u2022]/.test(cleaned)) {
		return false;
	}

	const startsWithActionVerb = ACTION_VERBS.some((verb) =>
		cleaned.startsWith(verb)
	);

	if (startsWithActionVerb) {
		return false;
	}

	return ROLE_KEYWORDS.some((keyword) =>
		cleaned.includes(keyword)
	);
};

const looksLikeCompany = (line) => {
	if (!line || line.length < 2 || line.length > 100) {
		return false;
	}

	const lower = line.toLowerCase();

	const hasIndicator = COMPANY_INDICATORS.some((indicator) =>
		lower.includes(indicator)
	);

	const words = line.split(/\s+/);

	const titleCaseWords = words.filter(
		(word) => /^[A-Z][A-Za-z&.-]*$/.test(word)
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

	const hasLocationKeyword =
		/(?:location|based|office|headquarters|city|state|country)/i.test(
			lower
		);

	const hasCityPattern =
		/^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:,\s*[A-Z]{2})?(?:,\s*[A-Za-z]+)?$/.test(
			line
		);

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

		const hasBullet = /^[-*•\u2022]/.test(trimmed);

		const hasActionVerb = ACTION_VERBS.some((verb) =>
			trimmed.toLowerCase().startsWith(verb)
		);

		if (hasBullet || hasActionVerb) {
			bullets.push(
				trimmed.replace(/^[-*•\u2022]\s*/, "")
			);
		}
	}

	return bullets;
};

const normalizeLocation = (location) => {
	if (!location) {
		return "";
	}

	let cleaned = location
		.trim()
		.replace(
			/^(?:location|based in|office|headquarters)\s*[:,-]?\s*/i,
			""
		);

	const indianCities = [
		"bangalore",
		"delhi",
		"mumbai",
		"hyderabad",
		"pune",
		"new delhi",
	];

	const isIndianCity = indianCities.some((city) =>
		cleaned.toLowerCase().includes(city)
	);

	if (
		isIndianCity &&
		!cleaned.toLowerCase().includes("india")
	) {
		cleaned += ", India";
	}

	return cleaned;
};

export function extractExperience(experienceText = "") {
	if (!experienceText) {
		return [];
	}

	experienceText = experienceText
		.replace(
			/AI-AssistedFullStackWebDevelopmentIntern/g,
			"AI-Assisted Full Stack Web Development Intern"
		)
		.replace(
			/DeveloperIntern/g,
			"Developer Intern"
		);

	const lines = experienceText
		.split("\n")
		.map((line) =>
			line
				.replace(/^[-*•\u2022\d.)\s]+/, "")
				.trim()
		)
		.filter(Boolean);

	const experiences = [];
	let currentExperience = null;
	let entryLines = [];

	for (const line of lines) {
		if (looksLikeRole(line)) {
			if (currentExperience) {
				currentExperience.description =
					extractDescriptionBullets(
						entryLines
					);

				experiences.push(
					currentExperience
				);
			}

			currentExperience = {
				role: line
					.replace(DATE_PATTERN, "")
					.trim(),
				company: "",
				location: "",
				duration: "",
				description: [],
			};

			entryLines = [];
			continue;
		}

		if (!currentExperience) {
			continue;
		}

		if (
			!currentExperience.company &&
			looksLikeCompany(line)
		) {
			currentExperience.company = line;
			continue;
		}

		if (
			!currentExperience.location &&
			looksLikeLocation(line)
		) {
			currentExperience.location =
				normalizeLocation(line);
			continue;
		}

		if (!currentExperience.duration) {
			const duration =
				extractDuration(line);

			if (duration) {
				currentExperience.duration =
					duration;
				continue;
			}
		}

		entryLines.push(line);
	}

	if (currentExperience) {
		currentExperience.description =
			extractDescriptionBullets(
				entryLines
			);

		experiences.push(currentExperience);
	}

	return experiences.filter(
		(exp) =>
			exp.role ||
			exp.company ||
			exp.duration ||
			exp.description.length > 0
	);
}

export default extractExperience;