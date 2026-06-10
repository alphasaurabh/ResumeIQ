const SECTION_PATTERNS = {
	education: [/^education:?$/i, /^academic(?:s| background)?:?$/i],
	summary: [
		/^professional summary:?$/i,
		/^summary:?$/i,
		/^profile:?$/i,
		/^career objective:?$/i,
		/^objective:?$/i,
	],
	skills: [/^skills:?$/i, /^technical skills:?$/i, /^core competencies:?$/i],
	projects: [
		/^projects:?$/i,
		/^personal projects:?$/i,
		/^technical projects:?$/i,
		/^academic projects:?$/i,
		/^key projects:?$/i,
	],
	experience: [
		/^experience:?$/i,
		/^work experience:?$/i,
		/^professional experience:?$/i,
	],
	certifications: [
		/^certifications?:?$/i,
		/^licenses? and certifications?:?$/i,
		/^achievements?\s*&\s*certifications?:?$/i,
		/^achievements?\s+and\s+certifications?:?$/i,
	],

	achievements: [
		/^achievements:?$/i,
		/^accomplishments:?$/i,
		/^awards:?$/i,
	],
};

const emptySections = () => ({
	summary: "",
	header: "",
	education: "",
	skills: "",
	projects: "",
	experience: "",
	certifications: "",
	achievements: "",
});

const resolveSectionKey = (line) => {
	const normalized = line.replace(/^[\-•*\s]+/, "").trim();

	for (const [sectionKey, patterns] of Object.entries(SECTION_PATTERNS)) {
		if (patterns.some((pattern) => pattern.test(normalized))) {
			return sectionKey;
		}
	}

	return null;
};

export function extractSections(text = "") {
	const sections = emptySections();

	if (!text) {
		return sections;
	}

	const lines = text
		.split("\n")
		.map((line) => line.trim())
		.filter(Boolean);

	let currentSection = "header";

	for (const line of lines) {
		const nextSection = resolveSectionKey(line);

		if (nextSection) {
			currentSection = nextSection;
			continue;
		}

		sections[currentSection] = sections[currentSection]
			? `${sections[currentSection]}\n${line}`
			: line;
	}

	return sections;
}

export default extractSections;
