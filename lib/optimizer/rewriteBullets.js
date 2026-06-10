const STRONG_VERBS = [
	"Built",
	"Developed",
	"Designed",
	"Implemented",
	"Optimized",
	"Engineered",
	"Architected",
	"Created",
	"Deployed",
	"Led",
	"Managed",
	"Delivered",
	"Integrated",
	"Automated",
	"Scaled",
	"Enhanced",
	"Refactored"
];

const WEAK_OPENERS = [
	/^helped\s+/i,
	/^assisted\s+/i,
	/^supported\s+/i,
	/^worked on\s+/i,
	/^was responsible for\s+/i,
	/^responsible for\s+/i,
	/^participated in\s+/i,
	/^contributed to\s+/i,
	/^involved in\s+/i,
];

const ACTION_LEADING_WORDS = /^(?:build(?:ing|s)?|built|develop(?:ing|ed|s)?|design(?:ing|ed|s)?|implement(?:ing|ed|s)?|optimiz(?:ing|ed|es)?|maintain(?:ing|ed|s)?|creat(?:ing|ed|es)?|improv(?:ing|ed|es)?|deploy(?:ing|ed|s)?|manag(?:ing|ed|es)?|lead(?:ing|s|)|support(?:ing|ed|s)?|engineer(?:ing|ed|s)?)\b\s*/i;

const KEYWORD_VERB_RULES = [
	{
		pattern: /\b(docker|kubernetes|container|deployment|deploy|ci\/cd|jenkins|terraform|aws|azure|gcp|cloud|release|shipping|ship)\b/i,
		verb: "Implemented",
		reason: "emphasizes deployment, container, or cloud delivery work",
	},
	{
		pattern: /\b(performance|latency|throughput|response time|query|cache|optimiz|scale|scalability|speed)\b/i,
		verb: "Optimized",
		reason: "emphasizes measurable performance improvement",
	},
	{
		pattern: /\b(design|ui|ux|interface|wireframe|prototype|layout|experience|responsive|mobile)\b/i,
		verb: "Designed",
		reason: "emphasizes design ownership",
	},
	{
		pattern: /\b(api|backend|service|microservice|feature|workflow|automation|integration|pipeline)\b/i,
		verb: "Developed",
		reason: "emphasizes feature and implementation work",
	},
	{
		pattern: /\b(project|app|application|dashboard|portal|tool|system|platform|website|site)\b/i,
		verb: "Built",
		reason: "emphasizes delivery of a concrete artifact",
	},
];

const normalizeWhitespace = (text) => String(text || "").replace(/\s+/g, " ").trim();

const stripBulletPrefix = (text) => normalizeWhitespace(String(text || "").replace(/^[-*•\u2022\d.)\s]+/, ""));

const wordCount = (text) => normalizeWhitespace(text).split(/\s+/).filter(Boolean).length;

const hasStrongVerb = (text) => {
	const lower = normalizeWhitespace(text).toLowerCase();
	return STRONG_VERBS.some((verb) => lower.startsWith(verb.toLowerCase()));
};

const hasMetric = (text) => /\b\d+(?:\.\d+)?%?|\b\d+(?:\.\d+)?x\b|\b(?:ms|seconds?|minutes?|hours?|days?|weeks?|users?|customers?|clients?|requests?|tickets?|issues?|records?|rows?|revenue|cost|latency|throughput|uptime|error rates?)\b/i.test(
	normalizeWhitespace(text)
);

const collectContextTokens = (context = {}) => {
	const tokens = [];

	for (const value of [context.role, context.company, context.title, context.location, context.duration]) {
		if (typeof value === "string" && value.trim()) {
			tokens.push(value.trim());
		}
	}

	if (Array.isArray(context.techStack)) {
		for (const tech of context.techStack) {
			if (typeof tech === "string" && tech.trim()) {
				tokens.push(tech.trim());
			}
		}
	}

	return tokens;
};

const chooseVerb = (text, context = {}) => {
	const candidateText = String(text || "");

	if (context.preferredVerb && STRONG_VERBS.includes(context.preferredVerb)) {
		return context.preferredVerb;
	}

	for (const rule of KEYWORD_VERB_RULES) {
		if (rule.pattern.test(candidateText)) {
			return rule.verb;
		}
	}

	if (context.section === "project") {
		return "Developed";
	}

	if (context.section === "experience") {
		return "Implemented";
	}

	return "Built";
};

const buildReason = (verb, text, context = {}) => {
	const matchedRule = KEYWORD_VERB_RULES.find((rule) => rule.verb === verb && rule.pattern.test(text));

	if (matchedRule) {
		return matchedRule.reason;
	}

	if (context.section === "project" && wordCount(text) <= 5) {
		return "expands a short project description without changing the underlying claim";
	}

	if (hasMetric(text)) {
		return "keeps the original result and strengthens the lead verb";
	}

	if (verb === "Designed") {
		return "uses a stronger design-focused verb";
	}

	if (verb === "Optimized") {
		return "uses a stronger performance-focused verb";
	}

	if (verb === "Implemented") {
		return "uses a stronger implementation-focused verb";
	}

	if (verb === "Developed") {
		return "uses a stronger delivery-focused verb";
	}

	return "uses a stronger action verb";
};

const buildProjectEnhancement = (targetText, context = {}) => {
	const fragments = [];
	const techStack = Array.isArray(context.techStack) ? context.techStack.filter(Boolean) : [];

	if (techStack.length > 0 && !/\busing\b/i.test(targetText)) {
		fragments.push(`using ${techStack.join(" and ")}`);
	}

	return fragments.length > 0 ? ` ${fragments.join(" ")}` : "";
};

const rewriteBullet = (bullet, context = {}) => {
	const original = stripBulletPrefix(bullet);

	if (!original) {
		return null;
	}

	const opener = WEAK_OPENERS.find((pattern) => pattern.test(original));
	const isProject = context.section === "project";
	const isShort = wordCount(original) <= 7;
	const shouldRewriteForProject =
		isProject &&
		!hasStrongVerb(original) &&
		(isShort || (!hasMetric(original) && wordCount(original) <= 12));

	if (!opener && !shouldRewriteForProject && hasStrongVerb(original)) {
		return {
			original,
			optimized: original,
			changed: false,
			verb: original.split(/\s+/)[0],
			reason: "already starts with a strong verb",
		};
	}

	let targetText = original;

	if (opener) {
		targetText = normalizeWhitespace(original.replace(opener, ""));
		targetText = normalizeWhitespace(targetText.replace(ACTION_LEADING_WORDS, ""));
	}

	if (shouldRewriteForProject) {
		targetText = normalizeWhitespace(targetText.replace(ACTION_LEADING_WORDS, ""));
	}

	if (!targetText) {
		return {
			original,
			optimized: original,
			changed: false,
			verb: "",
			reason: "rewrite would remove too much original content",
		};
	}

	const verb = chooseVerb(targetText, context);
	const enhancement = shouldRewriteForProject ? buildProjectEnhancement(targetText, context) : "";
	const optimized = normalizeWhitespace(`${verb} ${targetText}${enhancement}`);

	return {
		original,
		optimized,
		changed: optimized !== original,
		verb,
		reason: buildReason(verb, targetText, context),
	};
};

const rewriteBullets = (bullets = [], context = {}) => {
	if (!Array.isArray(bullets)) {
		return [];
	}

	return bullets
		.map((bullet) => rewriteBullet(bullet, context))
		.filter((item) => {
			if (!item || !item.changed) return false;

			const originalFirst =
				item.original.split(" ")[0].toLowerCase();

			const optimizedFirst =
				item.optimized.split(" ")[0].toLowerCase();

			// Reject Built -> Developed style nonsense
			if (
				item.original.replace(originalFirst, "").trim() ===
				item.optimized.replace(optimizedFirst, "").trim()
			) {
				return false;
			}

			return true;
		});
};

export { rewriteBullet, rewriteBullets };
export default rewriteBullets;
