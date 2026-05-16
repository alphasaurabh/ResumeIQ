import natural from "natural";
import nlp from "compromise";

const tokenizer = new natural.WordTokenizer();

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

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function extractSkills(inputText = "") {
	if (!inputText) {
		return [];
	}

	const text = inputText.toLowerCase();
	const tokenized = tokenizer.tokenize(text);
	const compromiseTerms = nlp(text)
		.terms()
		.out("array")
		.map((term) => term.toLowerCase());

	const corpus = new Set([...tokenized, ...compromiseTerms]);
	const foundSkills = [];

	for (const keyword of SKILL_KEYWORDS) {
		const normalizedKeyword = keyword.toLowerCase();
		const keywordPattern = new RegExp(`\\b${escapeRegex(normalizedKeyword)}\\b`, "i");

		const hasDirectPhraseMatch = keywordPattern.test(text);
		const hasTokenMatch = corpus.has(normalizedKeyword);

		if (hasDirectPhraseMatch || hasTokenMatch) {
			foundSkills.push(keyword);
		}
	}

	const skillsWithPosition = foundSkills.map((skill) => ({
		skill,
		position: text.indexOf(skill.toLowerCase()),
	}));

	skillsWithPosition.sort((a, b) => {
		if (a.position === -1 && b.position === -1) {
			return a.skill.localeCompare(b.skill);
		}

		if (a.position === -1) {
			return 1;
		}

		if (b.position === -1) {
			return -1;
		}

		return a.position - b.position;
	});

	return Array.from(new Set(skillsWithPosition.map((entry) => entry.skill)));
}

export default extractSkills;
