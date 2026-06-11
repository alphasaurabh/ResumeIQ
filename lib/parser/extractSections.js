const SECTION_PATTERNS = {
	education: [
		/\beducation\b/i,
		/\bacademic\b/i,
		/\beducational background\b/i,
	],

	summary: [
		/\bprofessional summary\b/i,
		/\bsummary\b/i,
		/\bprofile\b/i,
		/\bcareer objective\b/i,
		/\bobjective\b/i,
		/\babout me\b/i,
	],

	skills: [
		/\bskills\b/i,
		/\btechnical\s*skills\b/i,
		/\btechnicalskills\b/i,
		/\bcore competencies\b/i,
		/\btechnologies\b/i,
		/\btech stack\b/i,
	],

	projects: [
		/\bprojects\b/i,
		/\bpersonal projects\b/i,
		/\btechnical projects\b/i,
		/\bacademic projects\b/i,
		/\bkey projects\b/i,
	],

	experience: [
		/\bexperience\b/i,
		/\bwork experience\b/i,
		/\bprofessional experience\b/i,
		/\bemployment\b/i,
		/\binternship\b/i,
		/\bintern\b/i,
	],

	certifications: [
		/\bcertifications?\b/i,
		/\blicenses?\b/i,
		/\bachievements?\s*&\s*certifications?\b/i,
		/\bachievements?\s+and\s+certifications?\b/i,
	],

	achievements: [
		/\bachievements?\b/i,
		/\baccomplishments?\b/i,
		/\bawards?\b/i,
	],
};

const emptySections = () => ({
	header: "",
	summary: "",
	education: "",
	skills: "",
	projects: "",
	experience: "",
	certifications: "",
	achievements: "",
});

const normalizeLine = (line) =>
	line
		.replace(/[|]/g, " ")
		.replace(/\s+/g, " ")
		.trim();

const resolveSectionKey = (line) => {
	const normalized = normalizeLine(line);

	for (const [sectionKey, patterns] of Object.entries(
		SECTION_PATTERNS
	)) {
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
		.map((line) => normalizeLine(line))
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

	console.log("===== SECTION EXTRACTION =====");
	console.log(
		JSON.stringify(
			{
				header: sections.header.slice(0, 300),
				education: sections.education.slice(0, 300),
				skills: sections.skills.slice(0, 300),
				projects: sections.projects.slice(0, 300),
				experience: sections.experience.slice(0, 300),
				certifications: sections.certifications.slice(0, 300),
			},
			null,
			2
		)
	);

	return sections;
}

export default extractSections;