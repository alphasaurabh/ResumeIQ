import scoreFormatting from "./scoreFormatting";
import scoreSkills from "./scoreSkills";
import scoreProjects from "./scoreProjects";
import scoreExperience from "./scoreExperience";
import scoreReadability from "./scoreReadability";
import generateSuggestions from "./generateSuggestions";

const ACHIEVEMENT_KEYWORDS = [
	"achieved",
	"awarded",
	"winner",
	"won",
	"recognition",
	"honor",
	"scholarship",
	"rank",
	"certified",
	"promotion",
];

const ACHIEVEMENT_METRIC_PATTERN = /(\d+(?:\.\d+)?\s*%|\$\s*\d+(?:\.\d+)?(?:\s*[kmb])?|\b\d+(?:\.\d+)?\s*(?:users?|customers?|clients?|downloads?|revenue|hours|days|months|years|x)\b)/i;

const getProjectDescription = (project) => {
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

const scoreAchievements = (resume) => {
	const textSources = [];

	if (Array.isArray(resume.experience)) {
		textSources.push(
			...resume.experience
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
							Array.isArray(item.description) ? item.description.join(" ") : (item.description || ""),
						]
							.filter(Boolean)
							.join(" ");
					}
					return "";
				})
				.filter(Boolean)
		);
	}

	if (Array.isArray(resume.projects)) {
		textSources.push(...resume.projects.map((project) => getProjectDescription(project)));
	}

	if (Array.isArray(resume.certifications)) {
		textSources.push(
			...resume.certifications.filter((item) => typeof item === "string")
		);
	}

	const combinedText = textSources.join("\n").toLowerCase();
	if (!combinedText.trim()) {
		return 0;
	}

	const hasAchievementKeyword = ACHIEVEMENT_KEYWORDS.some((keyword) =>
		combinedText.includes(keyword)
	);
	const metricMatches = (combinedText.match(new RegExp(ACHIEVEMENT_METRIC_PATTERN, "gi")) || []).length;

	let score = 0;
	if (hasAchievementKeyword) {
		score += 5;
	}
	if (metricMatches >= 2) {
		score += 5;
	} else if (metricMatches === 1) {
		score += 3;
	}

	return Math.max(0, Math.min(10, score));
};
const scoreCompleteness = (resume) => {
	let score = 0;

	if (resume.name?.trim()) score += 5;
	if (resume.email?.trim()) score += 5;

	if (Array.isArray(resume.skills) && resume.skills.length > 0) {
		score += 10;
	}

	if (Array.isArray(resume.projects) && resume.projects.length > 0) {
		score += 10;
	}

	if (Array.isArray(resume.experience) && resume.experience.length > 0) {
		score += 10;
	}

	if (Array.isArray(resume.education) && resume.education.length > 0) {
		score += 10;
	}

	if (Array.isArray(resume.links) && resume.links.length > 0) {
		score += 5;
	}

	if (
		Array.isArray(resume.certifications) &&
		resume.certifications.length > 0
	) {
		score += 5;
	}

	return Math.min(score, 60);
};
export function scoreResume(resume) {
	if (!resume || typeof resume !== "object") {
		return {
			overall: 0,
			breakdown: {
				formatting: 0,
				skills: 0,
				projects: 0,
				experience: 0,
				readability: 0,
			},
			suggestions: [],
		};
	}

	try {
		const formattingScore = scoreFormatting(resume);
		const skillsScore = scoreSkills(resume);
		const projectsScore = scoreProjects(resume);
		const experienceScore = scoreExperience(resume);
		const readabilityScore = scoreReadability(resume);
		const achievementsScore = scoreAchievements(resume);

		const detailedBreakdown = {
			formatting: formattingScore,
			skills: skillsScore,
			projects: projectsScore,
			experience: experienceScore,
			readability: readabilityScore,
		};

		const completenessScore = scoreCompleteness(resume);

const qualityScore =
	formattingScore.score +
	skillsScore.score +
	projectsScore.score +
	experienceScore.score +
	readabilityScore.score +
	achievementsScore;

// Scale quality score (currently out of ~100) into a 40-point contribution
const normalizedQualityScore = Math.round(
	(qualityScore / 100) * 40
);

const overallScore =
	completenessScore +
	normalizedQualityScore;

		const finalOverall = Math.min(Math.max(Math.round(overallScore), 0), 100);
		const suggestions = generateSuggestions(resume, detailedBreakdown);

		return {
			overall: finalOverall,
			breakdown: {
				formatting: formattingScore.score,
				skills: skillsScore.score,
				projects: projectsScore.score,
				experience: experienceScore.score,
				readability: readabilityScore.score,
			},
			suggestions,
		};
	} catch (error) {
		return {
			overall: 0,
			breakdown: {
				formatting: 0,
				skills: 0,
				projects: 0,
				experience: 0,
				readability: 0,
			},
			suggestions: [],
		};
	}
}


export default scoreResume;

