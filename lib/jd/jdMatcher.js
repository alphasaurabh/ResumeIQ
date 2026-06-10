/**
 * Main Job Description Matcher orchestrator
 * Coordinates keyword extraction, comparison, and insight generation
 */

import extractKeywords from "./extractKeywords.js";
import compareSkills from "./compareSkills.js";
import generateMatchInsights from "./generateMatchInsights.js";

/**
 * Analyze job description match against parsed resume
 *
 * @param {string} jobDescription - Raw job description text
 * @param {object} resume - Parsed resume object with skills, experience, projects, etc.
 * @returns {object} Match analysis with score, matched/missing keywords, and suggestions
 */
const analyzeJDMatch = (jobDescription, resume) => {
	try {
		// Validate inputs
		if (!jobDescription || typeof jobDescription !== "string") {
			return {
				success: false,
				error: "Job description must be a non-empty string",
				matchScore: 0,
				matchedSkills: [],
				missingSkills: [],
				matchedKeywords: [],
				missingKeywords: [],
				suggestions: [],
			};
		}

		if (!resume || typeof resume !== "object") {
			return {
				success: false,
				error: "Resume must be a valid object",
				matchScore: 0,
				matchedSkills: [],
				missingSkills: [],
				matchedKeywords: [],
				missingKeywords: [],
				suggestions: [],
			};
		}

		// Step 1: Extract keywords from job description
		const extractedKeywords = extractKeywords(jobDescription);

		// Step 2: Compare with resume
		const comparison = compareSkills(extractedKeywords, resume);

		// Step 3: Generate insights
		const insights = generateMatchInsights(
			comparison,
			extractedKeywords,
			resume
		);

		// Step 4: Build final result object
		const result = {
			success: true,
			matchScore: insights.matchScore,
			matchQuality: insights.matchQuality,
			matchedSkills: comparison.matchedSkills,
			missingSkills: comparison.missingSkills,
			matchedKeywords: comparison.matchedKeywords,
			missingKeywords: comparison.missingKeywords,
			suggestions: insights.suggestions,
			breakdown: {
				skills: comparison.skillMatch,
				experience: comparison.experienceMatch,
				projects: comparison.projectMatch,
			},
			analysis: {
				totalKeywordsInJD: comparison.totalKeywordsInJD,
				matchedCount: comparison.matchedCount,
				hasMeasurements: insights.hasMeasurements,
				criticalGaps: insights.criticalGaps,
			},
			extractedKeywords: {
				technologies: extractedKeywords.technologies,
				experience: extractedKeywords.experience,
				projects: extractedKeywords.projects,
				softSkills: extractedKeywords.softSkills,
			},
		};

		return result;
	} catch (error) {
		console.error("Error in analyzeJDMatch:", error);
		return {
			success: false,
			error: error.message || "Unknown error during analysis",
			matchScore: 0,
			matchedSkills: [],
			missingSkills: [],
			matchedKeywords: [],
			missingKeywords: [],
			suggestions: [],
		};
	}
};

export default analyzeJDMatch;
