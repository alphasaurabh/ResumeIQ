const SECTION_STATUS = {
	parsed: "parsed",
	partial: "partial",
	missing: "missing",
};

const normalizeText = (value) => String(value || "").trim();

const isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;

const isFilledArray = (value) => Array.isArray(value) && value.some((item) => normalizeText(item).length > 0);

const countFilledFields = (item, fields = []) => {
	if (!item || typeof item !== "object") {
		return 0;
	}

	return fields.reduce((count, field) => {
		const value = item[field];
		if (isNonEmptyString(value)) {
			return count + 1;
		}

		if (Array.isArray(value)) {
			return count + (value.some((entry) => normalizeText(entry).length > 0) ? 1 : 0);
		}

		return count;
	}, 0);
};

const scoreByPresence = (present) => (present ? 100 : 0);

const scoreSkills = (skills = []) => {
	const count = Array.isArray(skills)
		? skills.map((skill) => normalizeText(skill)).filter(Boolean).length
		: 0;

	if (count <= 0) return 0;
	if (count === 1) return 50;
	if (count === 2) return 65;
	if (count <= 3) return 75;
	if (count <= 5) return 85;
	if (count <= 8) return 92;
	return 100;
};

const scoreProject = (project) => {
	if (!project) {
		return 0;
	}

	if (typeof project === "string") {
		const text = normalizeText(project);
		return text ? 50 : 0;
	}

	const titleScore = isNonEmptyString(project.title) ? 40 : 0;
	const descriptionScore = isNonEmptyString(project.description) ? 35 : 0;
	const techStackCount = Array.isArray(project.techStack)
		? project.techStack.map((tech) => normalizeText(tech)).filter(Boolean).length
		: 0;
	const techStackScore = techStackCount > 0 ? 25 : 0;

	return Math.min(100, titleScore + descriptionScore + techStackScore);
};

const scoreProjects = (projects = []) => {
	if (!Array.isArray(projects) || projects.length === 0) {
		return 0;
	}

	const total = projects.reduce((sum, project) => sum + scoreProject(project), 0);
	return Math.round(total / projects.length);
};

const countExperienceDetails = (experienceItem) => {
	if (!experienceItem) {
		return 0;
	}

	if (typeof experienceItem === "string") {
		return experienceItem
			.split(/(?:\n|(?<=[.!?]))\s+/)
			.map((part) => part.replace(/^[-*•\u2022\d.)\s]+/, "").trim())
			.filter(Boolean).length;
	}

	const description = experienceItem.description;
	if (Array.isArray(description)) {
		return description.map((item) => normalizeText(item)).filter(Boolean).length;
	}

	if (isNonEmptyString(description)) {
		return description
			.split(/(?:\n|(?<=[.!?]))\s+/)
			.map((part) => part.replace(/^[-*•\u2022\d.)\s]+/, "").trim())
			.filter(Boolean).length || 1;
	}

	return 0;
};

const scoreExperienceItem = (experienceItem) => {
	if (!experienceItem) {
		return 0;
	}

	if (typeof experienceItem === "string") {
		const detailCount = countExperienceDetails(experienceItem);
		if (detailCount <= 0) return 0;
		if (detailCount === 1) return 50;
		if (detailCount === 2) return 75;
		return 100;
	}

	const roleScore = isNonEmptyString(experienceItem.role) ? 20 : 0;
	const companyScore = isNonEmptyString(experienceItem.company) ? 20 : 0;
	const durationScore = isNonEmptyString(experienceItem.duration) ? 20 : 0;
	const detailCount = countExperienceDetails(experienceItem);

	let detailScore = 0;
	if (detailCount >= 3) {
		detailScore = 40;
	} else if (detailCount === 2) {
		detailScore = 30;
	} else if (detailCount === 1) {
		detailScore = 15;
	}

	return Math.min(100, roleScore + companyScore + durationScore + detailScore);
};

const scoreExperience = (experience = []) => {
	if (!Array.isArray(experience) || experience.length === 0) {
		return 0;
	}

	const total = experience.reduce((sum, item) => sum + scoreExperienceItem(item), 0);
	return Math.round(total / experience.length);
};

const scoreEducationItem = (educationItem) => {
	if (!educationItem) {
		return 0;
	}

	if (typeof educationItem === "string") {
		return normalizeText(educationItem) ? 50 : 0;
	}

	const institutionScore = isNonEmptyString(educationItem.institution) ? 40 : 0;
	const degreeScore = isNonEmptyString(educationItem.degree) ? 30 : 0;
	const durationScore = isNonEmptyString(educationItem.duration) ? 30 : 0;

	return Math.min(100, institutionScore + degreeScore + durationScore);
};

const scoreEducation = (education = []) => {
	if (!Array.isArray(education) || education.length === 0) {
		return 0;
	}

	const total = education.reduce((sum, item) => sum + scoreEducationItem(item), 0);
	return Math.round(total / education.length);
};

const scoreCertifications = (certifications = []) => {
	if (!Array.isArray(certifications) || certifications.length === 0) {
		return 0;
	}

	return isFilledArray(certifications) ? 100 : 0;
};

const getStatus = (score) => {
	if (score >= 100) {
		return SECTION_STATUS.parsed;
	}

	if (score > 0) {
		return SECTION_STATUS.partial;
	}

	return SECTION_STATUS.missing;
};

const buildBreakdownEntry = (section, score) => ({
	section,
	score: Math.max(0, Math.min(100, Math.round(score))),
	status: getStatus(score),
});

const countProjectTechStackGaps = (projects = []) => {
	if (!Array.isArray(projects)) {
		return 0;
	}

	return projects.reduce((count, project) => {
		if (!project || typeof project === "string") {
			return count;
		}

		const hasTitle = isNonEmptyString(project.title);
		const hasDescription = isNonEmptyString(project.description);
		const hasTechStack = Array.isArray(project.techStack)
			? project.techStack.some((tech) => normalizeText(tech).length > 0)
			: false;

		if (hasTitle && hasDescription && !hasTechStack) {
			return count + 1;
		}

		return count;
	}, 0);
};

const hasShortExperienceDescriptions = (experience = []) => {
	if (!Array.isArray(experience) || experience.length === 0) {
		return false;
	}

	const detailCounts = experience.map((item) => countExperienceDetails(item));
	const averageDetails = detailCounts.reduce((sum, count) => sum + count, 0) / detailCounts.length;
	return averageDetails < 2;
};

const calculateParseScore = (parsedResume = {}) => {
	const resume = parsedResume && typeof parsedResume === "object" ? parsedResume : {};

	const nameScore = buildBreakdownEntry("Name", scoreByPresence(isNonEmptyString(resume.name)));
	const emailScore = buildBreakdownEntry("Email", scoreByPresence(isNonEmptyString(resume.email)));
	const skillsScore = buildBreakdownEntry("Skills", scoreSkills(resume.skills));
	const projectsScore = buildBreakdownEntry("Projects", scoreProjects(resume.projects));
	const experienceScore = buildBreakdownEntry("Experience", scoreExperience(resume.experience));
	const educationScore = buildBreakdownEntry("Education", scoreEducation(resume.education));
	const certificationsScore = buildBreakdownEntry("Certifications", scoreCertifications(resume.certifications));

	const breakdown = [
		nameScore,
		emailScore,
		skillsScore,
		projectsScore,
		experienceScore,
		educationScore,
		certificationsScore,
	];

	const weightedScore =
		nameScore.score * 0.15 +
		emailScore.score * 0.15 +
		skillsScore.score * 0.2 +
		projectsScore.score * 0.2 +
		experienceScore.score * 0.2 +
		educationScore.score * 0.1;

	const parseScore = Math.max(0, Math.min(100, Math.round(weightedScore)));

	const missingSections = [];
	const parsedSections = [];

	for (const item of breakdown) {
		if (item.section === "Certifications") {
			if (item.score > 0) {
				parsedSections.push(item.section);
			}
			continue;
		}

		if (item.status === SECTION_STATUS.missing) {
			missingSections.push(item.section);
		} else {
			parsedSections.push(item.section);
		}
	}

	const warnings = [];

	if (nameScore.status === SECTION_STATUS.missing) {
		warnings.push("Name missing");
	}

	if (emailScore.status === SECTION_STATUS.missing) {
		warnings.push("Email missing");
	}

	if (countProjectTechStackGaps(resume.projects) > 0) {
		warnings.push("Projects missing tech stack");
	}

	if (hasShortExperienceDescriptions(resume.experience)) {
		warnings.push("Experience descriptions are short");
	}

	if (!Array.isArray(resume.certifications) || resume.certifications.length === 0) {
		warnings.push("No certifications detected");
	}

	return {
		parseScore,
		breakdown,
		missingSections,
		parsedSections,
		warnings,
	};
};

export default calculateParseScore;
export { calculateParseScore };