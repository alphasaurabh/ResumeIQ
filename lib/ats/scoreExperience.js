const MAX_EXPERIENCE_SCORE = 15;

const ACTION_VERBS = [
	"built",
	"developed",
	"designed",
	"implemented",
	"optimized",
	"created",
	"collaborated",
	"utilized",
	"managed",
	"led",
	"improved",
	"engineered",
	"integrated",
	"deployed",
	"analyzed",
	"maintained",
	"researched",
	"automated",
	"configured",
	"trained",
	"supported",
	"delivered",
	"tested",
	"debugged",
	"architected",
	"launched",
	"monitored",
	"enhanced",
	"developing",
	"building",
];

const METRIC_PATTERN = /(\d+(?:\.\d+)?\s*%|\$\s*\d+(?:\.\d+)?(?:\s*[kmb])?|\b\d+(?:\.\d+)?\s*(?:users?|customers?|clients?|downloads?|revenue|hours|days|months|years|x)\b)/i;

const hasActionVerb = (text = "") => {
	if (!text || typeof text !== "string") {
		return false;
	}

	const normalized = text.toLowerCase();
	for (const verb of ACTION_VERBS) {
		const regex = new RegExp(`\\b${verb}\\b`, "i");
		if (regex.test(normalized)) {
			return true;
		}
	}

	return false;
};

const hasMeasurableImpact = (text = "") => {
	if (!text || typeof text !== "string") {
		return false;
	}
	return METRIC_PATTERN.test(text);
};

export function scoreExperience(resume) {
	if (!resume || !Array.isArray(resume.experience)) {
		return { score: 0, breakdown: {} };
	}

	// Handle both structured objects and string arrays
	const experience = resume.experience
		.map((item) => {
			if (typeof item === "string") {
				return item;
			}
			if (typeof item === "object" && item.description) {
				// Combine all fields into text for analysis
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
		.filter((item) => typeof item === "string" && item.trim().length > 0);

	if (!experience.length) {
		return {
			score: 0,
			breakdown: { experienceCount: 0 },
			maxScore: MAX_EXPERIENCE_SCORE,
		};
	}

	const actionVerbMatches = experience.filter((line) => hasActionVerb(line)).length;
	const measurableImpactMatches = experience.filter((line) => hasMeasurableImpact(line)).length;
	const actionVerbCoverage = actionVerbMatches / experience.length;
	const measurableCoverage = measurableImpactMatches / experience.length;

	let actionVerbPoints = 0;

	if (actionVerbMatches >= 5) {
		actionVerbPoints = 7;
	} else if (actionVerbMatches >= 3) {
		actionVerbPoints = 6;
	} else if (actionVerbMatches >= 2) {
		actionVerbPoints = 5;
	} else if (actionVerbMatches >= 1) {
		actionVerbPoints = 4;
	}

	let measurableImpactPoints = 0;

	if (measurableImpactMatches >= 3) {
		measurableImpactPoints = 8;
	} else if (measurableImpactMatches >= 2) {
		measurableImpactPoints = 6;
	} else if (measurableImpactMatches >= 1) {
		measurableImpactPoints = 4;
	}

	const score = actionVerbPoints + measurableImpactPoints;
	const finalScore = Math.max(0, Math.min(MAX_EXPERIENCE_SCORE, score));
	const breakdown = {
		experienceCount: experience.length,
		actionVerbMatches,
		measurableImpactMatches,
		actionVerbPoints,
		measurableImpactPoints,
	};

	return {
		score: finalScore,
		breakdown,
		maxScore: MAX_EXPERIENCE_SCORE,
	};
}

export default scoreExperience;
