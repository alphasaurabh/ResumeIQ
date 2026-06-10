const MAX_PROJECTS_SCORE = 20;

const getDescription = (project) => {
	if (!project) {
		return "";
	}

	if (typeof project === "string") {
		return project.trim();
	}

	if (typeof project.description === "string") {
		return project.description.trim();
	}

	return "";
};

const hasTechStack = (project) => {
	if (!project || typeof project !== "object") {
		return false;
	}

	if (Array.isArray(project.techStack)) {
		return project.techStack.some(
			(tech) => typeof tech === "string" && tech.trim().length > 0
		);
	}

	if (typeof project.techStack === "string") {
		return project.techStack.trim().length > 0;
	}

	return false;
};

const isWeakDescription = (description = "") => {
	if (!description) {
		return true;
	}

	const words = description.split(/\s+/).filter(Boolean);
	return words.length < 8;
};

export function scoreProjects(resume) {
	if (!resume || !Array.isArray(resume.projects)) {
		return { score: 0, breakdown: {} };
	}

	const projects = resume.projects;
	const descriptions = projects.map(getDescription);
	const projectCount = projects.length;
	const descriptionCount = descriptions.filter(Boolean).length;
	const techStackCount = projects.filter((project) => hasTechStack(project)).length;
	const weakDescriptionCount = descriptions.filter((description) => isWeakDescription(description)).length;

	let projectCountPoints = 0;

	if (projectCount >= 4) {
		projectCountPoints = 5;
	} else if (projectCount >= 3) {
		projectCountPoints = 4;
	} else if (projectCount >= 2) {
		projectCountPoints = 3;
	} else if (projectCount >= 1) {
		projectCountPoints = 2;
	}

	let descriptionPoints = 0;

	if (descriptionCount === projectCount && projectCount > 0) {
		descriptionPoints = 5;
	} else if (descriptionCount > 0) {
		descriptionPoints = 3;
	}

	let techStackPoints = 0;

	if (techStackCount === projectCount && projectCount > 0) {
		techStackPoints = 5;
	} else if (techStackCount > 0) {
		techStackPoints = 3;
	}

	let weakDescriptionPenalty = 0;

	if (weakDescriptionCount >= projectCount && projectCount > 0) {
		weakDescriptionPenalty = -3;
	}

	const score = projectCountPoints + descriptionPoints + techStackPoints + weakDescriptionPenalty;
	const finalScore = Math.max(0, Math.min(MAX_PROJECTS_SCORE, score));

	const breakdown = {
		projectCount,
		descriptionCount,
		techStackCount,
		weakDescriptionCount,
		projectCountPoints,
		descriptionPoints,
		techStackPoints,
		weakDescriptionPenalty,
	};

	return {
		score: finalScore,
		breakdown,
		maxScore: MAX_PROJECTS_SCORE,
	};
}

export default scoreProjects;
