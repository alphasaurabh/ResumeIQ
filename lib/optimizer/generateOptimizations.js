import { rewriteBullet } from "./rewriteBullets.js";

const STRONG_VERBS = ["built", "developed", "designed", "implemented", "optimized", "engineered", "created", "improved", "deployed"];

const METRIC_PATTERN = /\b\d+(?:\.\d+)?%?|\b\d+(?:\.\d+)?x\b|\b(?:ms|seconds?|minutes?|hours?|days?|weeks?|users?|customers?|clients?|requests?|tickets?|issues?|records?|rows?|revenue|cost|latency|throughput|uptime|error rates?)\b/i;
const SHORT_BULLET_THRESHOLD = 7;

const normalizeValue = (value) => String(value || "").trim();

const dedupe = (items = []) => {
	const seen = new Set();
	const output = [];

	for (const item of items) {
		const text = normalizeValue(item);
		if (!text) {
			continue;
		}

		const key = text.toLowerCase();
		if (seen.has(key)) {
			continue;
		}

		seen.add(key);
		output.push(text);
	}

	return output;
};

const sentenceSplit = (text = "") => {
	return String(text)
		.split(/(?:\n|(?<=[.!?]))\s+/)
		.map((part) => part.replace(/^[-*•\u2022\d.)\s]+/, "").trim())
		.filter(Boolean);
};

const hasMetric = (text = "") => METRIC_PATTERN.test(String(text));

const hasStrongVerb = (text = "") => {
	const lower = String(text).trim().toLowerCase();
	return STRONG_VERBS.some((verb) => lower.startsWith(verb));
};

const wordCount = (text = "") => normalizeValue(text).split(/\s+/).filter(Boolean).length;

const getSectionBullets = (parsedResume, sectionName) => {
	if (!parsedResume || typeof parsedResume !== "object") {
		return [];
	}

	if (sectionName === "experience" && Array.isArray(parsedResume.experience)) {
		return parsedResume.experience.flatMap((item, itemIndex) => {
			if (typeof item === "string") {
				return sentenceSplit(item).map((text, bulletIndex) => ({
					section: "experience",
					itemIndex,
					bulletIndex,
					text,
					context: {
						section: "experience",
						role: "",
						company: "",
						duration: "",
					},
				}));
			}

			const bullets = Array.isArray(item?.description) ? item.description : [];
			return bullets.map((text, bulletIndex) => ({
				section: "experience",
				itemIndex,
				bulletIndex,
				text,
				context: {
					section: "experience",
					role: item?.role || "",
					company: item?.company || "",
					location: item?.location || "",
					duration: item?.duration || "",
				},
			}));
		});
	}

	if (sectionName === "projects" && Array.isArray(parsedResume.projects)) {
		return parsedResume.projects.flatMap((item, itemIndex) => {
			const source = item?.description || item?.title || "";
			const bullets = sentenceSplit(source);

			return bullets.map((text, bulletIndex) => ({
				section: "projects",
				itemIndex,
				bulletIndex,
				text,
				context: {
					section: "project",
					title: item?.title || "",
					techStack: Array.isArray(item?.techStack) ? item.techStack : [],
				},
			}));
		});
	}

	return [];
};

const scoreBullets = (bullets = []) => {
	if (!bullets.length) {
		return 0;
	}

	const strongVerbCount = bullets.filter((bullet) => hasStrongVerb(bullet.text)).length;
	const metricCount = bullets.filter((bullet) => hasMetric(bullet.text)).length;
	const shortCount = bullets.filter((bullet) => wordCount(bullet.text) <= SHORT_BULLET_THRESHOLD).length;
	const lengthBonus = bullets.reduce((sum, bullet) => {
		return sum + (wordCount(bullet.text) >= 10 ? 1 : 0);
	}, 0);

	const score = Math.round(
		(strongVerbCount / bullets.length) * 35 +
		(metricCount / bullets.length) * 30 +
		((bullets.length - shortCount) / bullets.length) * 20 +
		(Math.min(lengthBonus, bullets.length) / bullets.length) * 15
	);

	return Math.min(100, score);
};

const buildKeywordSuggestion = (keyword) => {
	const term = normalizeValue(keyword).toLowerCase();

	if (!term) {
		return "";
	}

	if (/(docker|kubernetes|container|deployment|deploy|ci\/cd|jenkins|terraform)/.test(term)) {
		return "Add deployment wording to an existing bullet so the resume reflects containerization, release, or infrastructure work already done.";
	}

	if (/(aws|azure|gcp|cloud)/.test(term)) {
		return "Tie an existing bullet to cloud deployment, infrastructure, or environment ownership instead of adding new claims.";
	}

	if (/(react|next\.js|vue|angular|frontend|ui|ux|interface)/.test(term)) {
		return "Rewrite one existing project bullet to show frontend ownership, component delivery, or interface implementation.";
	}

	if (/(api|backend|service|microservice|rest|graphql)/.test(term)) {
		return "Use an existing experience or project bullet to emphasize backend implementation, API delivery, or service ownership.";
	}

	if (/(sql|postgres|mysql|mongodb|redis|database|query|schema)/.test(term)) {
		return "Connect one existing bullet to data-layer work such as queries, schemas, caching, or database tuning.";
	}

	if (/(testing|qa|automation|tdd|bdd)/.test(term)) {
		return "Rephrase an existing bullet to show testing, automation, or validation work you already completed.";
	}

	if (/(leadership|mentoring|communication|collaboration|teamwork)/.test(term)) {
		return "Add wording from an existing bullet that shows collaboration, mentoring, or team ownership.";
	}

	if (/(performance|optimization|latency|speed|scalability)/.test(term)) {
		return "Use an existing bullet to highlight performance work, scale, or optimization impact without inventing new metrics.";
	}

	if (/(project|portfolio|deployment|launch|built|developed|implemented)/.test(term)) {
		return "Strengthen one existing project bullet with clearer ownership, implementation detail, or launch context.";
	}

	return `Review existing bullets for ${keyword} and tie the wording to work already present in the resume.`;
};

const buildWeakSectionReason = (sectionName, bullets, score, hasMeasurements) => {
	if (!bullets.length) {
		if (sectionName === "projects") {
			return "No project bullets were found to optimize.";
		}

		if (sectionName === "experience") {
			return "No experience bullets were found to optimize.";
		}

		return "No section content was found to optimize.";
	}

	const metricCount = bullets.filter((bullet) => hasMetric(bullet.text)).length;
	const strongVerbCount = bullets.filter((bullet) => hasStrongVerb(bullet.text)).length;
	const shortCount = bullets.filter((bullet) => wordCount(bullet.text) <= SHORT_BULLET_THRESHOLD).length;

	if (metricCount === 0 && strongVerbCount === 0) {
		return sectionName === "projects"
			? "Project bullets lack measurable impact and strong action verbs."
			: "Bullets lack measurable impact and strong action verbs.";
	}

	if (metricCount === 0 && !hasMeasurements) {
		return sectionName === "projects"
			? "Project bullets need measurable impact to support the work already described."
			: "Bullets need measurable impact to support the work already described.";
	}

	if (shortCount > bullets.length / 2) {
		return sectionName === "projects"
			? "Project bullets are too short and need more implementation detail from the existing resume content."
			: "Bullets are too short and need more implementation detail from the existing resume content.";
	}

	if (strongVerbCount === 0) {
		return sectionName === "projects"
			? "Project bullets can be tightened with stronger action verbs."
			: "Bullets can be tightened with stronger action verbs.";
	}

	return sectionName === "projects"
		? `Project section scored ${score}/100 and should show more implementation detail.`
		: `Section scored ${score}/100 and should show more ownership and impact.`;
};

const buildImprovementNotes = ({ projectScore, experienceScore, hasMeasurements, missingSkills, optimizedBullets, weakSections }) => {
	const improvements = [];

	if (optimizedBullets.length > 0) {
		improvements.push(
			"Rewrite weak bullets with stronger action verbs such as Built, Developed, Designed, Implemented, Optimized, or Engineered while keeping the original meaning."
		);
	}

	if (!hasMeasurements) {
		improvements.push(
			"Add measurable metrics only when they already exist in your work history; do not invent numbers or impact."
		);
	}

	if (projectScore < 65 || weakSections.some((item) => item.section === "projects")) {
		improvements.push(
			"Improve weak project descriptions by expanding existing bullets with implementation details, technology already mentioned in the resume, and outcomes you can support."
		);
	}

	if (experienceScore < 65 || weakSections.some((item) => item.section === "experience")) {
		improvements.push(
			"Strengthen experience bullets by clarifying scope, responsibility, and impact using only the facts already present in the resume."
		);
	}

	if (missingSkills.some((term) => /docker|kubernetes|deployment|ci\/cd|jenkins|terraform/i.test(term))) {
		improvements.push(
			"If Docker or similar deployment tools are missing, reword an existing project or experience bullet to emphasize deployment, release, or infrastructure work already done."
		);
	}

	if (missingSkills.some((term) => /react|next\.js|vue|angular|frontend|ui|ux/i.test(term))) {
		improvements.push(
			"For frontend gaps, rewrite an existing project bullet to emphasize component delivery, interface ownership, or product-facing implementation."
		);
	}

	if (missingSkills.some((term) => /sql|postgres|mysql|mongodb|redis|database|query|schema/i.test(term))) {
		improvements.push(
			"For data gaps, connect an existing bullet to queries, schemas, caching, or database tuning instead of adding new experience."
		);
	}

	return dedupe(improvements);
};

const generateOptimizations = (parsedResume = {}, jdMatchOutput = {}) => {
	if (!parsedResume || typeof parsedResume !== "object") {
		return {
			optimizedBullets: [],
			keywordSuggestions: [],
			weakSections: [],
			improvements: [],
		};
	}

	const optimizedBullets = [];
	const keywordSuggestions = [];
	const weakSections = [];

	const experienceBullets = getSectionBullets(parsedResume, "experience");
	const projectBullets = getSectionBullets(parsedResume, "projects");
	const missingSkills = Array.isArray(jdMatchOutput?.missingSkills)
		? jdMatchOutput.missingSkills
		: [];
	const missingKeywords = Array.isArray(jdMatchOutput?.missingKeywords)
		? jdMatchOutput.missingKeywords
		: [];
	const analysis = jdMatchOutput?.analysis || {};
	const hasMeasurements = Boolean(analysis.hasMeasurements);
	const keywordTerms = dedupe([...missingSkills, ...missingKeywords]);

	for (const bullet of experienceBullets) {
		const rewrite = rewriteBullet(bullet.text, bullet.context);
		if (rewrite?.changed) {
			optimizedBullets.push({
				section: bullet.section,
				itemIndex: bullet.itemIndex,
				bulletIndex: bullet.bulletIndex,
				original: rewrite.original,
				optimized: rewrite.optimized,
				reason: rewrite.reason,
			});
		}
	}

	for (const bullet of projectBullets) {
		const rewrite = rewriteBullet(bullet.text, bullet.context);
		if (rewrite?.changed) {
			optimizedBullets.push({
				section: bullet.section,
				itemIndex: bullet.itemIndex,
				bulletIndex: bullet.bulletIndex,
				original: rewrite.original,
				optimized: rewrite.optimized,
				reason: rewrite.reason,
			});
		}
	}

	for (const keyword of keywordTerms) {
		const suggestion = buildKeywordSuggestion(keyword);
		if (suggestion) {
			keywordSuggestions.push(suggestion);
		}
	}

	if (!hasMeasurements) {
		keywordSuggestions.push(
			"Add measurable metrics only where the resume already supports them, using counts, percentages, time saved, scale, or throughput."
		);
	}

	const experienceScore = scoreBullets(experienceBullets);
	const projectScore = scoreBullets(projectBullets);
	const skillsMissing = missingSkills.length > 0 || !Array.isArray(parsedResume.skills) || parsedResume.skills.length === 0;

	if (experienceBullets.length === 0 || experienceScore < 65) {
		weakSections.push({
			section: "experience",
			score: experienceScore,
			reason: buildWeakSectionReason("experience", experienceBullets, experienceScore, hasMeasurements),
		});
	}

	if (projectBullets.length === 0 || projectScore < 65) {
		weakSections.push({
			section: "projects",
			score: projectScore,
			reason: buildWeakSectionReason("projects", projectBullets, projectScore, hasMeasurements),
		});
	}

	if (skillsMissing) {
		weakSections.push({
			section: "skills",
			score: Math.max(0, 100 - Math.min(60, missingSkills.length * 12)),
			reason: missingSkills.length > 0
				? `Skills section misses ${missingSkills.length} JD keyword${missingSkills.length === 1 ? "" : "s"}.`
				: "Skills section is too thin to cover the target role.",
		});
	}

	const improvements = buildImprovementNotes({
		projectScore,
		experienceScore,
		hasMeasurements,
		missingSkills,
		optimizedBullets,
		weakSections,
	});

	return {
		optimizedBullets,
		keywordSuggestions: dedupe(keywordSuggestions),
		weakSections,
		improvements,
	};
};

export default generateOptimizations;
export { generateOptimizations };
