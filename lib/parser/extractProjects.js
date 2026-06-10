import natural from "natural";
import nlp from "compromise";
import cleanArtifacts from "./cleanArtifacts";

const sentenceTokenizer = new natural.SentenceTokenizer();

const PROJECT_BLACKLIST = [
	"achievements",
	"certifications",
	"achievement",
	"certification",
	"hackathon",
	"bug bounty",
	"web dev bootcamp",
	"education",
	"experience",
	"skills",
	"summary",
	"profile",
];

const TECH_KEYWORDS = [
	"javascript",
	"typescript",
	"python",
	"java",
	"c++",
	"c#",
	"go",
	"ruby",
	"php",
	"react",
	"next.js",
	"node.js",
	"express",
	"vue",
	"angular",
	"html",
	"css",
	"tailwind",
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
	"firebase",
	"api",
	"frontend",
	"backend",
	"fullstack",
	"database",
	"sql",
	"nosql",
];

const normalizeProjectLine = (line) =>
	line
		.replace(/^[-*•\u2022\d.)\s]+/, "")
		.replace(/\s+/g, " ")
		.trim();

const isPotentialTitle = (line) => {

	if (line.split(/\s+/).length > 6) {
		return false;
	}
	if (!line) {
		return false;
	}

	if (line.length > 80) {
		return false;
	}

	if (/[.!?]$/.test(line)) {
		return false;
	}

	if (/^\d{1,2}$/.test(line.trim())) {
		return false;
	}

	if (/^[^\w\s]+$/.test(line)) {
		return false;
	}

	const terms = nlp(line).terms().out("array");
	if (terms.length === 0) {
		return false;
	}
	const lower = line.toLowerCase();

	if (
		PROJECT_BLACKLIST.some(item =>
			lower.includes(item)
		)
	) {
		return false;
	}
	const titleCaseCount = terms.filter((term) => /^[A-Z][A-Za-z0-9#+.-]*$/.test(term)).length;
	return titleCaseCount >= Math.ceil(terms.length / 2);

};

const extractTechStack = (descriptionText = "") => {
	if (!descriptionText) {
		return [];
	}

	const lower = descriptionText.toLowerCase();
	const foundTech = [];

	for (const tech of TECH_KEYWORDS) {
		const regex = new RegExp(`\\b${tech.replace(/[+.]/g, "\\$&")}\\b`, "gi");
		if (regex.test(lower)) {
			foundTech.push(tech);
		}
	}

	return Array.from(new Set(foundTech));
};

export function extractProjects(projectsText = "") {
	if (!projectsText) {
		return [];
	}

	const lines = projectsText
		.split("\n")
		.map(normalizeProjectLine)
		.filter(Boolean);

	const projects = [];
	let currentProject = null;

	for (const line of lines) {
		const hasInlineSeparator = /\|/.test(line);

		if (hasInlineSeparator) {
			const [title, ...techParts] = line.split("|");

			const techText = techParts.join(" ").trim();

			const techStack = extractTechStack(techText);

			currentProject = {
				title: cleanArtifacts(title.trim()),
				description: "",
				techStack,
			};

			projects.push(currentProject);

			continue;
		}

		if (isPotentialTitle(line)) {

			console.log("TITLE DETECTED =>", line);

			if (currentProject) {
				currentProject.description = currentProject.description.trim();
			}

			currentProject = {
				title: cleanArtifacts(line),
				description: "",
				techStack: [],
			};

			projects.push(currentProject);
			continue;
		}
		if (!currentProject) {
	continue;
}

		currentProject.description = `${currentProject.description} ${line}`.trim();
		currentProject.techStack = extractTechStack(currentProject.description);
	}

	const deduped = [];
	const seen = new Set();

	for (const project of projects) {
		const title = project.title?.trim();
		const description = project.description?.trim();

		if (!title || !description) {
			continue;
		}

		const key = `${title.toLowerCase()}::${description.toLowerCase()}`;
		if (seen.has(key)) {
			continue;
		}

		seen.add(key);
		deduped.push({
			title,
			description,
			techStack: project.techStack || [],
		});
	}

	return deduped;
}

export default extractProjects;
