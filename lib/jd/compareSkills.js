/**
 * Compare extracted job keywords with resume data
 */
const SKILL_ALIASES = {
	api: ["apis", "rest api", "rest apis", "api development"],
	postgres: ["postgresql"],
	postgresql: ["postgres"],
	nodejs: ["node.js", "node"],
	"node.js": ["nodejs", "node"],
	mongodb: ["mongo"],
	mongo: ["mongodb"],
	javascript: ["js"],
	js: ["javascript"],
	typescript: ["ts"],
	ts: ["typescript"],
	ci: ["ci/cd"],
	"ci/cd": ["ci"],
	oauth: ["oauth2"],
	agile: ["scrum"],
	scrum: ["agile"],
	ai: ["machine learning", "ml"],
	ml: ["machine learning", "ai"]
};

const normalizeForComparison = (text) => {
	if (!text) return "";
	return text
		.toLowerCase()
		.replace(/[^\w\s+#]/g, "")
		.trim();
};

/**
 * Check if a skill is mentioned in the resume
 */
const matchSkill = (keyword, resumeText) => {
	if (!resumeText || !keyword) {
		return false;
	}

	const normalizedKeyword =
		normalizeForComparison(keyword);

	const normalizedResume =
		normalizeForComparison(resumeText);

	if (
		normalizedResume.includes(
			normalizedKeyword
		)
	) {
		return true;
	}

	const aliases =
		SKILL_ALIASES[normalizedKeyword] || [];

	for (const alias of aliases) {
		if (
			normalizedResume.includes(
				normalizeForComparison(alias)
			)
		) {
			return true;
		}
	}

	return false;
};

/**
 * Get all resume text combined
 */
const getCombinedResumeText = (resume) => {
	if (!resume) return "";

	const parts = [];

	if (resume.skills && Array.isArray(resume.skills)) {
		parts.push(resume.skills.join(" "));
	}

	if (resume.experience && Array.isArray(resume.experience)) {
		resume.experience.forEach((exp) => {
			if (typeof exp === "string") {
				parts.push(exp);
			} else if (exp.role || exp.company || exp.description) {
				parts.push([exp.role, exp.company, exp.description].join(" "));
			}
		});
	}

	if (resume.projects && Array.isArray(resume.projects)) {
		resume.projects.forEach((proj) => {
			if (typeof proj === "string") {
				parts.push(proj);
			} else if (proj.title || proj.description || proj.techStack) {
				const tech = Array.isArray(proj.techStack)
					? proj.techStack.join(" ")
					: proj.techStack || "";
				parts.push([proj.title, proj.description, tech].join(" "));
			}
		});
	}

	if (resume.education && Array.isArray(resume.education)) {
		resume.education.forEach((edu) => {
			if (typeof edu === "string") {
				parts.push(edu);
			} else if (edu.school || edu.degree || edu.field) {
				parts.push([edu.school, edu.degree, edu.field].join(" "));
			}
		});
	}

	return parts.join(" ");
};

/**
 * Compare skills with resume
 */
const compareSkills = (extractedKeywords, resume) => {
	if (!extractedKeywords || !resume) {
		return {
			matchedSkills: [],
			missingSkills: [],
			matchedKeywords: [],
			missingKeywords: [],
			skillMatch: 0,
			experienceMatch: 0,
			projectMatch: 0,
		};
	}

	const resumeText = getCombinedResumeText(resume);

	const matchedSkills = [];
	const missingSkills = [];
	const matchedKeywords = [];
	const missingKeywords = [];

	// Compare technologies (highest weight)
	if (extractedKeywords.technologies && Array.isArray(extractedKeywords.technologies)) {
		extractedKeywords.technologies.forEach((tech) => {
			if (matchSkill(tech, resumeText)) {
				matchedSkills.push(tech);
				matchedKeywords.push(tech);
			} else {
				missingSkills.push(tech);
				missingKeywords.push(tech);
			}
		});
	}

	// Compare soft skills
	if (
		extractedKeywords.softSkills &&
		Array.isArray(extractedKeywords.softSkills)
	) {
		extractedKeywords.softSkills.forEach((skill) => {
			if (matchSkill(skill, resumeText)) {
				if (!matchedKeywords.includes(skill)) {
					matchedKeywords.push(skill);
				}
			} else {
				if (!missingKeywords.includes(skill)) {
					missingKeywords.push(skill);
				}
			}
		});
	}

	// Compare experience keywords
	if (
		extractedKeywords.experience &&
		Array.isArray(extractedKeywords.experience)
	) {
		extractedKeywords.experience.forEach((exp) => {
			if (matchSkill(exp, resumeText)) {
				if (!matchedKeywords.includes(exp)) {
					matchedKeywords.push(exp);
				}
			} else {
				if (!missingKeywords.includes(exp)) {
					missingKeywords.push(exp);
				}
			}
		});
	}

	// Compare project keywords
	if (extractedKeywords.projects && Array.isArray(extractedKeywords.projects)) {
		extractedKeywords.projects.forEach((proj) => {
			if (matchSkill(proj, resumeText)) {
				if (!matchedKeywords.includes(proj)) {
					matchedKeywords.push(proj);
				}
			} else {
				if (!missingKeywords.includes(proj)) {
					missingKeywords.push(proj);
				}
			}
		});
	}

	// Calculate match percentages
	const technologyCount =
		(extractedKeywords.technologies || []).length;

	const technologyMatches =
		(extractedKeywords.technologies || [])
			.filter(tech =>
				matchSkill(tech, resumeText)
			).length;

	const skillMatch =
		technologyCount > 0
			? Math.round(
				(technologyMatches /
					technologyCount) *
				100
			)
			: 0;
	const experienceCount = (extractedKeywords.experience || []).length;
	const projectCount = (extractedKeywords.projects || []).length;
	const experienceMatches = extractedKeywords.experience
		? extractedKeywords.experience.filter((exp) =>
			matchSkill(exp, resumeText)
		).length
		: 0;
	const projectMatches = extractedKeywords.projects
		? extractedKeywords.projects.filter((proj) =>
			matchSkill(proj, resumeText)
		).length
		: 0;

	const experienceMatch =
		experienceCount > 0
			? Math.round((experienceMatches / experienceCount) * 100)
			: 0;
	const projectMatch =
		projectCount > 0 ? Math.round((projectMatches / projectCount) * 100) : 0;


	const unique = (arr) =>
		[...new Set(arr.map(normalizeForComparison))];

	const finalMatchedKeywords =
		unique(matchedKeywords);

	const finalMissingKeywords =
		unique(missingKeywords);

	return {
		matchedSkills,
		missingSkills,
		matchedKeywords: finalMatchedKeywords,
		missingKeywords: finalMissingKeywords,
		skillMatch,
		experienceMatch,
		projectMatch,
		totalKeywordsInJD: extractedKeywords.allKeywords
			? extractedKeywords.allKeywords.length
			: 0,
		matchedCount: finalMatchedKeywords.length,
	};

};

export default compareSkills;
