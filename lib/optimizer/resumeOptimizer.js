import generateOptimizations from "./generateOptimizations.js";

const createEmptyOptimizationReport = () => ({
	optimizedBullets: [],
	keywordSuggestions: [],
	weakSections: [],
	improvements: [],
});

const optimizeResume = (parsedResume, jdMatchOutput = {}) => {
	if (!parsedResume || typeof parsedResume !== "object") {
		return createEmptyOptimizationReport();
	}

	return generateOptimizations(parsedResume, jdMatchOutput && typeof jdMatchOutput === "object" ? jdMatchOutput : {});
};

export default optimizeResume;
export { optimizeResume, createEmptyOptimizationReport };
