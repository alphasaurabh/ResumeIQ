const MAX_FORMATTING_SCORE = 20;

export function scoreFormatting(resume) {
	if (!resume || typeof resume !== "object") {
		return { score: 0, breakdown: {} };
	}

	const links = Array.isArray(resume.links) ? resume.links : [];
	const hasEmail = Boolean(typeof resume.email === "string" && resume.email.trim());
	const hasGithub = links.some(
		(link) => typeof link === "string" && link.toLowerCase().includes("github")
	);
	const hasLinkedin = links.some(
		(link) => typeof link === "string" && link.toLowerCase().includes("linkedin")
	);

	const hasCoreHeadings =
		Array.isArray(resume.experience) &&
		resume.experience.length > 0 &&
		Array.isArray(resume.education) &&
		resume.education.length > 0 &&
		Array.isArray(resume.skills) &&
		resume.skills.length > 0;

	const breakdown = {
		emailPoints: hasEmail ? 5 : 0,
		githubPoints: hasGithub ? 5 : 0,
		linkedinPoints: hasLinkedin ? 5 : 0,
		headingPenalty: hasCoreHeadings ? 5 : -5,
		hasCoreHeadings,
	};

	const score =
		breakdown.emailPoints +
		breakdown.githubPoints +
		breakdown.linkedinPoints +
		breakdown.headingPenalty;

	const finalScore = Math.max(0, Math.min(MAX_FORMATTING_SCORE, score));

	return {
		score: finalScore,
		breakdown,
		maxScore: MAX_FORMATTING_SCORE,
	};
}

export default scoreFormatting;
