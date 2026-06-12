const SKILL_KEYWORDS = [
	"javascript",
	"typescript",
	"python",
	"java",
	"c",
	"c++",
	"c#",
	"go",
	"ruby",
	"php",
	"react",
	"next.js",
	"node.js",
	"express",
	"nestjs",
	"vue",
	"angular",
	"html",
	"css",
	"tailwind",
	"redux",
	"zustand",
	"graphql",
	"rest",
	"mongodb",
	"postgresql",
	"mysql",
	"sqlite",
	"redis",
	"prisma",
	"docker",
	"kubernetes",
	"aws",
	"azure",
	"gcp",
	"git",
	"github",
	"gitlab",
	"linux",
	"figma",
	"firebase",
	"jest",
	"cypress",
	"playwright",
	"pandas",
	"numpy",
	"scikit-learn",
	"tensorflow",
	"pytorch",
	"nlp",
	"machine learning",
	"data structures",
	"algorithms",
	"oop",
	"sql",
	"nosql",
	"ci/cd",
];

export function extractSkills(inputText = "") {
	if (!inputText) {
		return [];
	}

	const text = inputText.toLowerCase();
	const foundSkills = [];

	for (const skill of SKILL_KEYWORDS) {
		if (text.includes(skill.toLowerCase())) {
			foundSkills.push({
				skill,
				position: text.indexOf(skill.toLowerCase()),
			});
		}
	}

	foundSkills.sort((a, b) => a.position - b.position);

	return [...new Set(foundSkills.map((item) => item.skill))];
}

export default extractSkills;