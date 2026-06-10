export function generateSuggestions(resume, scoreBreakdown) {
	if (!resume || typeof resume !== "object") {
		return [];
	}

	const suggestions = [];
	const projectsBreakdown = scoreBreakdown?.projects?.breakdown || {};
	const skillsBreakdown = scoreBreakdown?.skills?.breakdown || {};
	const experienceBreakdown = scoreBreakdown?.experience?.breakdown || {};

	if ((experienceBreakdown.measurableImpactMatches || 0) === 0) {
		suggestions.push("Add measurable metrics");
	}

	if ((experienceBreakdown.actionVerbMatches || 0) === 0) {
		suggestions.push("Use stronger action verbs");
	}

	if (
		(projectsBreakdown.weakDescriptionCount || 0) > 0 ||
		(projectsBreakdown.descriptionPoints || 0) < 5
	) {
		suggestions.push("Expand project descriptions");
	}

	if ((skillsBreakdown.relevantSkills || 0) < 8) {
		suggestions.push("Add more role-specific skills");
	}

	return Array.from(new Set(suggestions));
}

export default generateSuggestions;
