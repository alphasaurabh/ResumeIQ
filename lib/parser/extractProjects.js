import natural from "natural";
import nlp from "compromise";

const sentenceTokenizer = new natural.SentenceTokenizer();

const normalizeProjectLine = (line) =>
	line
		.replace(/^[-*•\u2022\d.)\s]+/, "")
		.replace(/\s+/g, " ")
		.trim();

const isPotentialTitle = (line) => {
	if (!line) {
		return false;
	}

	if (line.length > 80) {
		return false;
	}

	if (/[.!?]$/.test(line)) {
		return false;
	}

	const terms = nlp(line).terms().out("array");
	if (terms.length === 0) {
		return false;
	}

	const titleCaseCount = terms.filter((term) => /^[A-Z][A-Za-z0-9#+.-]*$/.test(term)).length;
	return titleCaseCount >= Math.ceil(terms.length / 2);
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
		const hasInlineSeparator = /\s[-:|]\s/.test(line);

		if (hasInlineSeparator) {
			const [title, ...descParts] = line.split(/\s[-:|]\s/);
			const description = descParts.join(" - ").trim();

			if (title && description) {
				projects.push({
					title: title.trim(),
					description,
				});
				currentProject = null;
				continue;
			}
		}

		if (isPotentialTitle(line)) {
			if (currentProject) {
				currentProject.description = currentProject.description.trim();
			}

			currentProject = {
				title: line,
				description: "",
			};
			projects.push(currentProject);
			continue;
		}

		if (!currentProject) {
			const [firstSentence, ...restSentences] = sentenceTokenizer.tokenize(line);

			if (firstSentence && restSentences.length > 0) {
				projects.push({
					title: firstSentence.replace(/[.!?]$/, "").trim(),
					description: restSentences.join(" ").trim(),
				});
			}

			continue;
		}

		currentProject.description = `${currentProject.description} ${line}`.trim();
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
		deduped.push({ title, description });
	}

	return deduped;
}

export default extractProjects;
