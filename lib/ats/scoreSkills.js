const MAX_SKILLS_SCORE = 20;

const TECH_SKILL_KEYWORDS = [
	"javascript",
	"typescript",
	"python",
	"java",
	"c++",
	"c#",
	"go",
	"ruby",
	"php",
	"rust",
	"kotlin",
	"swift",
	"react",
	"next.js",
	"vue",
	"angular",
	"svelte",
	"node.js",
	"express",
	"django",
	"flask",
	"spring",
	"fastapi",
	"rails",
	"laravel",
	"asp.net",
	"graphql",
	"rest",
	"html",
	"css",
	"tailwind",
	"bootstrap",
	"sass",
	"less",
	"webpack",
	"vite",
	"rollup",
	"mongodb",
	"postgresql",
	"mysql",
	"sqlite",
	"redis",
	"elasticsearch",
	"cassandra",
	"dynamodb",
	"firestore",
	"prisma",
	"sequelize",
	"typeorm",
	"sqlalchemy",
	"docker",
	"kubernetes",
	"git",
	"github",
	"gitlab",
	"bitbucket",
	"jenkins",
	"ci/cd",
	"aws",
	"azure",
	"gcp",
	"google cloud",
	"firebase",
	"heroku",
	"vercel",
	"netlify",
	"linux",
	"windows",
	"macos",
	"jira",
	"agile",
	"scrum",
	"api",
	"microservices",
	"testing",
	"jest",
	"pytest",
	"mocha",
	"cypress",
	"selenium",
];

const SOFT_SKILL_KEYWORDS = [
	"communication",
	"collaboration",
	"leadership",
	"problem solving",
	"teamwork",
	"adaptability",
	"time management",
	"critical thinking",
	"analytical",
	"creative",
	"attention to detail",
	"project management",
];

const normalizeSkill = (skill) => skill.toLowerCase().trim();

const isRelevantSkill = (skill) => {
	const normalized = normalizeSkill(skill);
	return (
		TECH_SKILL_KEYWORDS.some((keyword) =>
			normalized.includes(keyword) || keyword.includes(normalized)
		) ||
		SOFT_SKILL_KEYWORDS.some((keyword) =>
			normalized.includes(keyword) || keyword.includes(normalized)
		)
	);
};

export function scoreSkills(resume) {
	if (!resume || !Array.isArray(resume.skills)) {
		return { score: 0, breakdown: {} };
	}

	const skills = resume.skills.filter((skill) => typeof skill === "string" && skill.trim());
	const uniqueSkills = Array.from(new Set(skills.map(normalizeSkill)));
	const relevantSkills = uniqueSkills.filter((skill) => isRelevantSkill(skill));
	const relevantCount = relevantSkills.length;

	let score = 0;
	if (relevantCount >= 18) {
		score = 20;
	} else if (relevantCount >= 15) {
		score = 18;
	} else if (relevantCount >= 12) {
		score = 16;
	} else if (relevantCount >= 9) {
		score = 13;
	} else if (relevantCount >= 6) {
		score = 10;
	} else if (relevantCount >= 3) {
		score = 6;
	}

	const finalScore = Math.max(0, Math.min(MAX_SKILLS_SCORE, score));
	const breakdown = {
		totalSkills: uniqueSkills.length,
		relevantSkills: relevantCount,
		irrelevantSkills: Math.max(0, uniqueSkills.length - relevantCount),
	};

	return {
		score: finalScore,
		breakdown,
		maxScore: MAX_SKILLS_SCORE,
	};
}

export default scoreSkills;
