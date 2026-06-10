/**
 * Generate actionable insights and suggestions from match analysis
 */

const SUGGESTION_TEMPLATES = {
	docker: "Highlight Docker containerization experience",
	kubernetes: "Add Kubernetes orchestration experience",
	aws: "Mention AWS cloud infrastructure work",
	azure: "Include Azure cloud platform experience",
	gcp: "Add Google Cloud Platform projects",
	react: "Showcase React component development projects",
	vue: "Highlight Vue.js application work",
	angular: "Include Angular enterprise experience",
	"next.js": "Add Next.js full-stack projects",
	express: "Mention Express.js backend development",
	django: "Include Django web application projects",
	flask: "Add Flask microservices or APIs",
	spring: "Highlight Spring Boot applications",
	laravel: "Include Laravel full-stack projects",
	mongodb: "Mention NoSQL and MongoDB experience",
	postgres: "Add PostgreSQL database projects",
	mysql: "Highlight MySQL optimization work",
	redis: "Include Redis caching implementations",
	graphql: "Mention GraphQL API development",
	"rest api": "Highlight RESTful API design and implementation",
	microservices: "Add microservices architecture projects",
	ci: "Mention continuous integration/deployment pipelines",
	"ci/cd": "Highlight automated CI/CD workflows",
	jenkins: "Add Jenkins pipeline configuration",
	terraform: "Include infrastructure-as-code experience",
	git: "Mention version control and git workflow",
	github: "Add GitHub collaboration projects",
	tdd: "Highlight test-driven development practices",
	agile: "Mention Agile/Scrum methodology experience",
	ml: "Add machine learning or AI projects",
	"machine learning": "Include ML model development experience",
	security: "Highlight security best practices implementation",
	"performance optimization": "Add performance tuning and optimization work",
	scalability: "Mention designing for scale",
	jwt: "Include JWT authentication implementations",
	oauth: "Highlight OAuth2 integration experience",
	websocket: "Add real-time WebSocket implementations",
	elasticsearch: "Mention Elasticsearch search implementations",
	testing: "Highlight comprehensive test coverage",
	automation: "Add automation framework development",
	devops: "Mention DevOps practices and tools",
	"full-stack": "Highlight both frontend and backend expertise",
	leadership: "Add leadership or team mentoring experience",
	communication: "Highlight collaboration and documentation skills",
	mentoring: "Add junior developer mentoring experience",
};

const MEASUREMENT_SUGGESTIONS = [
	"Include quantifiable metrics (response time, throughput, load handled)",
	"Add performance improvements (e.g., reduced load time by 40%)",
	"Mention scale (e.g., handled 100k+ daily active users)",
	"Include reliability metrics (uptime, error rates)",
	"Add business impact (revenue, cost savings)",
];

const BEST_PRACTICE_SUGGESTIONS = [
	"Add code samples or portfolio links",
	"Highlight problem-solving approach",
	"Include architecture diagrams or technical decisions",
	"Mention code quality tools and practices",
	"Add security considerations and implementations",
	"Highlight performance optimization techniques",
	"Include user feedback or product impact",
	"Add cross-functional collaboration examples",
];

/**
 * Generate suggestions based on missing skills
 */
const generateMatchInsights = (comparison, extractedKeywords, resume) => {
	const suggestions = [];
	const priority = [];

	if (!comparison || !extractedKeywords) {
		return {
			suggestions,
			priority,
			hasMeasurements:
				resume &&
				resume.experience &&
				resume.experience.some(
					(exp) =>
						typeof exp === "string" &&
						/\d+/.test(exp)
				),
		};
	}

	const { missingSkills, missingKeywords, skillMatch, experienceMatch } =
		comparison;

	// High priority: critical technologies
	const criticalTechs = [
		"react",
		"node.js",
		"javascript",
		"typescript",
	];
	const criticalMissing = missingSkills.filter((skill) =>
		criticalTechs.some((tech) => skill.toLowerCase().includes(tech))
	);

	if (criticalMissing.length > 0) {
		criticalMissing.forEach((tech) => {
			const suggestion =
				SUGGESTION_TEMPLATES[tech.toLowerCase()] || `Add ${tech} experience`;
			if (!suggestions.includes(suggestion)) {
				suggestions.push(suggestion);
				priority.push({
					suggestion,
					impact: "high",
					skill: tech,
				});
			}
		});
	}

	// Medium priority: other missing skills
	const otherMissing = missingSkills.filter(
		(skill) =>
			!criticalTechs.some((tech) =>
				skill.toLowerCase().includes(tech)
			)
	);

	if (otherMissing.length > 0 && otherMissing.length <= 5) {
		otherMissing.forEach((skill) => {
			const suggestion =
				SUGGESTION_TEMPLATES[skill.toLowerCase()] ||
				`Mention ${skill} experience`;
			if (!suggestions.includes(suggestion)) {
				suggestions.push(suggestion);
				priority.push({
					suggestion,
					impact: "medium",
					skill,
				});
			}
		});
	} else if (otherMissing.length > 5) {
		// Too many missing skills, suggest focusing on top categories
		suggestions.push(
			"Focus on demonstrating depth in key technologies"
		);
		priority.push({
			suggestion:
				"Focus on demonstrating depth in key technologies",
			impact: "medium",
		});
	}

	// Check for measurements and impact metrics
	const hasMeasurements =
		resume &&
		resume.experience &&
		resume.experience.some((exp) => {
			const text =
				typeof exp === "string"
					? exp
					: (exp.description || "").toString();
			return /\d+%|\d+x|improved|increased|reduced|optimized/.test(
				text
			);
		});

	if (!hasMeasurements && experienceMatch < 80) {
		suggestions.push(
			"Add quantifiable metrics (performance improvements, scale handled, impact)"
		);
		priority.push({
			suggestion:
				"Add quantifiable metrics (performance improvements, scale handled, impact)",
			impact: "high",
		});
	}

	// Low priority: best practices
	if (suggestions.length < 5) {
		if (!hasMeasurements) {
			suggestions.push(
				"Include specific business or technical impact from projects"
			);
		}

		if (
			!resume ||
			!resume.projects ||
			resume.projects.length === 0
		) {
			suggestions.push("Add portfolio projects or open-source contributions");
		}

		const resumeText =
			resume && resume.experience
				? resume.experience.join(" ").toLowerCase()
				: "";
		if (
			!resumeText.includes("agile") &&
			!resumeText.includes("scrum") &&
			extractedKeywords.experience &&
			extractedKeywords.experience.some((exp) =>
				["agile", "scrum"].includes(exp.toLowerCase())
			)
		) {
			suggestions.push(
				"Highlight Agile/Scrum methodology experience"
			);
		}
	}

	// Calculate match score (skills 50%, experience 30%, projects 20%)
	const baseMatchScore =
		(skillMatch || 0) * 0.5 +
		(experienceMatch || 0) * 0.3 +
		(comparison.projectMatch || 0) * 0.2;

	// Penalize for missing critical skills
	const penalty = Math.min(
		5 * criticalMissing.length,
		15
	);

	const matchScore = Math.max(
		0,
		Math.round(baseMatchScore - penalty)
	);

	return {
		suggestions: suggestions.slice(0, 5), // Limit to top 5
		priority: priority.slice(0, 5),
		matchScore,
		matchQuality:
			matchScore >= 80
				? "Excellent"
				: matchScore >= 60
					? "Good"
					: matchScore >= 40
						? "Fair"
						: "Needs Improvement",
		hasMeasurements,
		criticalGaps: criticalMissing,
	};
};

export default generateMatchInsights;
