const MAX_READABILITY_SCORE = 15;

const BULLET_PATTERN = /^\s*(?:[-*•\u2022]|\d+[.)])\s+/;

const getProjectText = (project) => {
	if (!project) {
		return "";
	}

	if (typeof project === "string") {
		return project;
	}

	if (typeof project.description === "string") {
		return project.description;
	}

	return "";
};

const getAnalysisText = (resume) => {
	// Handle both structured experience objects and strings
	const experienceText = Array.isArray(resume.experience)
		? resume.experience
				.map((item) => {
					if (typeof item === "string") {
						return item;
					}
					if (typeof item === "object") {
						return [
							item.role || "",
							item.company || "",
							item.location || "",
							item.duration || "",
							Array.isArray(item.description) ? item.description.join("\n") : (item.description || ""),
						]
							.filter(Boolean)
							.join("\n");
					}
					return "";
				})
				.join("\n")
		: "";

	const projectText = Array.isArray(resume.projects)
		? resume.projects.map((project) => getProjectText(project)).join("\n")
		: "";

	return `${experienceText}\n${projectText}`.trim();
};

const getNonEmptyLines = (text = "") =>
	text
		.split("\n")
		.map((line) => line.trim())
		.filter(Boolean);

const getAverageSentenceLength = (text = "") => {
	const sentences = text
		.split(/[.!?\n]+/)
		.map((segment) => segment.trim())
		.filter(Boolean);

	if (!sentences.length) {
		return 0;
	}

	const totalWords = sentences.reduce(
		(sum, sentence) => sum + sentence.split(/\s+/).filter(Boolean).length,
		0
	);

	return totalWords / sentences.length;
};

export function scoreReadability(resume) {
	if (!resume || typeof resume !== "object") {
		return { score: 0, breakdown: {} };
	}

	const analysisText = getAnalysisText(resume);
	if (!analysisText) {
		return {
			score: 0,
			breakdown: {
				bulletLines: 0,
				averageSentenceLength: 0,
				averageWordsPerLine: 0,
				bulletStructurePoints: 0,
				sentenceLengthPoints: 0,
				textDensityPoints: 0,
			},
			maxScore: MAX_READABILITY_SCORE,
		};
	}

	const lines = getNonEmptyLines(analysisText);
	const bulletLines = lines.filter((line) => BULLET_PATTERN.test(line)).length;
	const averageSentenceLength = getAverageSentenceLength(analysisText);
	const totalWords = lines.reduce(
		(sum, line) => sum + line.split(/\s+/).filter(Boolean).length,
		0
	);
	const averageWordsPerLine = lines.length ? totalWords / lines.length : 0;

	let bulletStructurePoints = 0;
	if (bulletLines >= 3) {
		bulletStructurePoints = 5;
	} else if (bulletLines >= 1) {
		bulletStructurePoints = 3;
	}

	let sentenceLengthPoints = 0;
	if (averageSentenceLength >= 8 && averageSentenceLength <= 24) {
		sentenceLengthPoints = 5;
	} else if (
		(averageSentenceLength >= 6 && averageSentenceLength < 8) ||
		(averageSentenceLength > 24 && averageSentenceLength <= 30)
	) {
		sentenceLengthPoints = 3;
	} else if (averageSentenceLength > 0) {
		sentenceLengthPoints = 1;
	}

	let textDensityPoints = 0;
	if (averageWordsPerLine >= 8 && averageWordsPerLine <= 18) {
		textDensityPoints = 5;
	} else if (averageWordsPerLine >= 5 && averageWordsPerLine <= 22) {
		textDensityPoints = 3;
	}

	const score = bulletStructurePoints + sentenceLengthPoints + textDensityPoints;
	const finalScore = Math.max(0, Math.min(MAX_READABILITY_SCORE, score));
	const breakdown = {
		bulletLines,
		averageSentenceLength: Number(averageSentenceLength.toFixed(1)),
		averageWordsPerLine: Number(averageWordsPerLine.toFixed(1)),
		bulletStructurePoints,
		sentenceLengthPoints,
		textDensityPoints,
	};

	return {
		score: finalScore,
		breakdown,
		maxScore: MAX_READABILITY_SCORE,
	};
}

export default scoreReadability;
