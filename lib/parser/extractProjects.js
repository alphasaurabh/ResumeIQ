import cleanArtifacts from "./cleanArtifacts";

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
	if (!line) return false;

	const lower = line.toLowerCase();

	if (
		PROJECT_BLACKLIST.some((item) =>
			lower.includes(item)
		)
	) {
		return false;
	}

	if (line.length > 120) {
		return false;
	}

	if (/[.!?]$/.test(line)) {
		return false;
	}

	const words = line.split(/\s+/);

	const titleCaseWords = words.filter(
		(word) => /^[A-Z][A-Za-z0-9#+.-]*$/.test(word)
	);

	return titleCaseWords.length >= 1;
};

const extractTechStack = (text = "") => {
	if (!text) return [];

	const lower = text.toLowerCase();
	const found = [];

	for (const tech of TECH_KEYWORDS) {
		if (lower.includes(tech.toLowerCase())) {
			found.push(tech);
		}
	}

	return [...new Set(found)];
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
		const hasInlineSeparator = line.includes("|");

		if (hasInlineSeparator) {
			const [title, ...rest] = line.split("|");

			currentProject = {
				title: cleanArtifacts(title.trim()),
				description: "",
				techStack: extractTechStack(rest.join(" ")),
			};

			projects.push(currentProject);
			continue;
		}

		if (isPotentialTitle(line)) {
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

		currentProject.description =
			`${currentProject.description} ${line}`.trim();

		currentProject.techStack = [
			...new Set([
				...currentProject.techStack,
				...extractTechStack(line),
			]),
		];
	}

	const seen = new Set();

	return projects
		.map((project) => ({
			title: project.title?.trim(),
			description: project.description?.trim(),
			techStack: [...new Set(project.techStack || [])],
		}))
		.filter((project) => {
			if (!project.title || !project.description) {
				return false;
			}

			const key =
				project.title.toLowerCase() +
				"::" +
				project.description.toLowerCase();

			if (seen.has(key)) {
				return false;
			}

			seen.add(key);
			return true;
		});
}

export default extractProjects;
