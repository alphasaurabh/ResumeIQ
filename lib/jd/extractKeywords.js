/**
 * Extract keywords and requirements from job description
 */

const TECH_KEYWORDS = [
	// Languages
	"javascript",
	"typescript",
	"python",
	"java",
	"c#",
	"c++",
	"golang",
	"rust",
	"ruby",
	"php",
	"swift",
	"kotlin",
	// Frameworks
	"react",
	"vue",
	"angular",
	"next.js",
	"express",
	"django",
	"flask",
	"spring",
	"laravel",
	"rails",
	"fastapi",
	// Databases
	"sql",
	"postgres",
	"mysql",
	"mongodb",
	"redis",
	"elasticsearch",
	"cassandra",
	"dynamodb",
	// Cloud & DevOps
	"aws",
	"azure",
	"gcp",
	"docker",
	"kubernetes",
	"jenkins",
	"ci/cd",
	"terraform",
	// APIs & Protocols
	"rest api",
	"graphql",
	"grpc",
	"websocket",
	"oauth",
	"jwt",
	// Tools & Platforms
	"git",
	"github",
	"gitlab",
	"bitbucket",
	"jira",
	"slack",
	"figma",
	"webpack",
	"babel",
	// Methodologies
	
	"kanban",
	"tdd",
	"bdd",
	"microservices",
	// Other
	"html",
	"css",
	"json",
	"xml",
	"ml",
	"machine learning",
	"ai",
	"data science",
];

const EXPERIENCE_KEYWORDS = [
	"5+ years",
	"3+ years",
	"10+ years",
	"2+ years",
	"1+ year",
	"senior",
	"junior",
	"lead",
	"architect",
	"full-stack",
	"backend",
	"frontend",
	"devops",
	"qa",
	"testing",
	"automation",
	"performance optimization",
	"scalability",
	"security",
	"debugging",
	"troubleshooting",
	"mentoring",
];

const PROJECT_KEYWORDS = [
	"portfolio",
	"github",
	"project",
	"side project",
	"open source",
	"contribution",
	"deployment",
	"production",
	"live",
	"launch",
	"shipped",
	"released",
	"built",
	"developed",
	"implemented",
	"maintained",
	"managed",
];

const SOFT_SKILLS = [
	"communication",
	"problem-solving",
	"creativity",
	"critical thinking",
	"time management",
	"attention to detail",
	"adaptability",
	"leadership",
	"teamwork",
	"collaboration",
	"documentation",
	"mentoring",
	"teaching",
	"agile",
	"scrum",
];

const MEASUREMENT_KEYWORDS = [
	"improved",
	"increased",
	"decreased",
	"reduced",
	"optimized",
	"scaled",
	"deployed",
	"launched",
	"achieved",
	"delivered",
	"%",
	"x faster",
	"ms",
	"seconds",
	"hours",
	"days",
	"weeks",
	"millions",
	"thousands",
];

/**
 * Normalize text for matching
 */
const normalizeText = (text) => {
	return text
		.toLowerCase()
		.replace(/[^\w\s+#]/g, "")
		.trim();
};

/**
 * Extract keywords from job description
 */
const extractKeywords = (jdText) => {
	if (!jdText || typeof jdText !== "string") {
		return {
			technologies: [],
			experience: [],
			projects: [],
			softSkills: [],
			measurements: [],
			allKeywords: [],
		};
	}

	const normalizedText = normalizeText(jdText);
	const textLower = jdText.toLowerCase();

	const technologies = [];
	const experience = [];
	const projects = [];
	const softSkills = [];
	const measurements = [];
	const allKeywords = [];

	// Extract technologies
	for (const keyword of TECH_KEYWORDS) {
		const regex = new RegExp(
			`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
			"i"
		);

		if (regex.test(textLower)) {
			technologies.push(keyword);
			allKeywords.push(keyword);
		}
	}

	// Extract experience keywords
	for (const keyword of EXPERIENCE_KEYWORDS) {
		const regex = new RegExp(
			`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
			"i"
		);

		if (regex.test(textLower)) {
			experience.push(keyword);
			allKeywords.push(keyword);
		}
	}

	// Extract project keywords
	for (const keyword of PROJECT_KEYWORDS) {
		const regex = new RegExp(
			`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
			"i"
		);

		if (regex.test(textLower)) {
			projects.push(keyword);
			allKeywords.push(keyword);
		}
	}

	// Extract soft skills
	for (const keyword of SOFT_SKILLS) {
		const regex = new RegExp(
			`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
			"i"
		);

		if (regex.test(textLower)) {
			softSkills.push(keyword);
			allKeywords.push(keyword);
		}
	}

	// Extract measurement keywords
	for (const keyword of MEASUREMENT_KEYWORDS) {
		const regex = new RegExp(
			`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
			"i"
		);

		if (regex.test(textLower)) {
			measurements.push(keyword);
			allKeywords.push(keyword);
		}
	}

	return {
		technologies: [...new Set(technologies)],
		experience: [...new Set(experience)],
		projects: [...new Set(projects)],
		softSkills: [...new Set(softSkills)],
		measurements: [...new Set(measurements)],
		allKeywords: [...new Set(allKeywords)],
	};
};

export default extractKeywords;
