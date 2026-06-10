"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
	ArrowUpRight,
	BrainCircuit,
	CheckCircle2,
	Loader2,
	Sparkles,
	Target,
	XCircle,
} from "lucide-react";

interface JDMatcherProps {
	resumeData?: {
		skills?: string[];
		experience?: unknown[];
		projects?: unknown[];
		education?: unknown[];
		[key: string]: unknown;
	};
	resume?: {
		skills?: string[];
		experience?: unknown[];
		projects?: unknown[];
		education?: unknown[];
		[key: string]: unknown;
	};
	onAnalysisComplete?: (result: MatchResult | null) => void;
}

export interface MatchResult {
	success: boolean;
	matchScore: number;
	matchQuality?: string;
	matchedSkills: string[];
	missingSkills: string[];
	matchedKeywords: string[];
	missingKeywords: string[];
	suggestions: string[];
	breakdown?: {
		skills?: number;
		experience?: number;
		projects?: number;
	};
	analysis?: {
		totalKeywordsInJD?: number;
		matchedCount?: number;
		hasMeasurements?: boolean;
		criticalGaps?: string[];
	};
	error?: string;
}

const DEFAULT_RESULT: MatchResult = {
	success: false,
	matchScore: 0,
	matchedSkills: [],
	missingSkills: [],
	matchedKeywords: [],
	missingKeywords: [],
	suggestions: [],
};

const chipStyles = {
	matched: "border-emerald-200 bg-emerald-50 text-emerald-700",
	missing: "border-rose-200 bg-rose-50 text-rose-700",
	keyword: "border-cyan-200 bg-cyan-50 text-cyan-700",
};

const scoreRingColor = (score: number) => {
	if (score >= 80) return "#22c55e";
	if (score >= 60) return "#06b6d4";
	if (score >= 40) return "#f59e0b";
	return "#fb7185";
};

const scoreLabel = (score: number) => {
	if (score >= 80) return "Strong match";
	if (score >= 60) return "Promising match";
	if (score >= 40) return "Partial match";
	return "Needs work";
};

const formatCount = (items?: string[]) => (items?.length ? items.length : 0);

const SectionCard = ({
	title,
	subtitle,
	children,
	className = "",
}: {
	title: string;
	subtitle?: string;
	children: ReactNode;
	className?: string;
}) => (
	<div
		className={`rounded-3xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}
	>
		<div className="mb-4">
			<h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-900">
				{title}
			</h3>
			{subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
		</div>
		{children}
	</div>
);

const JDMatcher = ({ resumeData, resume, onAnalysisComplete }: JDMatcherProps) => {
	const effectiveResumeData = resumeData ?? resume;
	const [jobDescription, setJobDescription] = useState("");
	const [isAnalyzing, setIsAnalyzing] = useState(false);
	const [result, setResult] = useState<MatchResult | null>(null);
	const [error, setError] = useState("");

	const hasResume = useMemo(
		() => Boolean(effectiveResumeData && Object.keys(effectiveResumeData).length > 0),
		[effectiveResumeData]
	);

	const handleAnalyze = async () => {
		const description = jobDescription.trim();

		if (!description || !hasResume) {
			return;
		}

		setIsAnalyzing(true);
		setError("");
		onAnalysisComplete?.(null);

		try {
			const response = await fetch("/api/jd-match", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					jobDescription: description,
					resumeData: effectiveResumeData,
				}),
			});

			const payload = await response.json();

			if (!response.ok || !payload?.success) {
				throw new Error(
					payload?.error || "Unable to analyze the job description."
				);
			}

			const matchResult = payload.data ?? DEFAULT_RESULT;
			setResult(matchResult);
			onAnalysisComplete?.(matchResult);
		} catch (analysisError) {
			setResult(null);
			onAnalysisComplete?.(null);
			setError(
				analysisError instanceof Error
					? analysisError.message
					: "Unable to analyze the job description."
			);
		} finally {
			setIsAnalyzing(false);
		}
	};

	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.08,
				delayChildren: 0.1,
			},
		},
	};

	const itemVariants = {
		hidden: { opacity: 0, y: 18 },
		visible: {
			opacity: 1,
			y: 0,
			transition: { duration: 0.45 },
		},
	};

	const ringSize = 168;
	const ringStroke = 10;
	const ringRadius = (ringSize - ringStroke) / 2;
	const ringCircumference = 2 * Math.PI * ringRadius;
	const ringOffset =
		ringCircumference -
		(result ? Math.min(result.matchScore, 100) / 100 : 0) * ringCircumference;

	return (
		<motion.div
			variants={containerVariants}
			initial="hidden"
			animate="visible"
			className="w-full max-w-7xl mx-auto"
		>
			<motion.div
				variants={itemVariants}
				className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-lg sm:p-6 md:p-8"
			>
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.04),transparent_38%)] pointer-events-none opacity-20" />
				<div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-slate-200 to-transparent" />

				<div className="relative z-10">
					<div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
							<div className="space-y-2">
							<div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-indigo-600 shadow-sm">
								<BrainCircuit className="h-3.5 w-3.5" />
								JD Match Analyzer
							</div>
							<h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
								Job Description Matcher
							</h2>
							<p className="max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
								Paste a job description, run the analysis, and compare it against the parsed resume data already in the app.
							</p>
						</div>
						<div className="rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
							{hasResume ? "Resume data connected" : "Upload a resume first"}
						</div>
					</div>

					<div className="grid gap-6 lg:grid-cols-2">
						<motion.div variants={itemVariants} className="space-y-4">
							<SectionCard
								title="Job Description"
								subtitle="Paste a target role or full posting."
							>
								<div className="space-y-4">
									<label className="sr-only" htmlFor="job-description">
										Job description
									</label>
									<textarea
										id="job-description"
										value={jobDescription}
										onChange={(event) => setJobDescription(event.target.value)}
										placeholder="Paste job description here"
										className="min-h-72 w-full rounded-3xl border border-slate-200 bg-white px-4 py-4 text-sm leading-6 text-slate-700 placeholder:text-slate-400 outline-none transition focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-50 resize-none"
									/>

									<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
										<p className="text-xs leading-5 text-slate-500">
											Results only appear after analysis and use the parsed resume data in the workspace.
										</p>
										<motion.button
											type="button"
											onClick={handleAnalyze}
											disabled={isAnalyzing || !jobDescription.trim() || !hasResume}
											whileHover={{ scale: isAnalyzing || !jobDescription.trim() || !hasResume ? 1 : 1.01 }}
											whileTap={{ scale: isAnalyzing || !jobDescription.trim() || !hasResume ? 1 : 0.99 }}
											className="inline-flex items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-indigo-600 to-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow transition disabled:cursor-not-allowed disabled:opacity-45"
										>
											{isAnalyzing ? (
												<>
													<Loader2 className="h-4 w-4 animate-spin" />
													Analyzing...
												</>
											) : (
												<>
													<ArrowUpRight className="h-4 w-4" />
													Analyze Match
												</>
											)}
										</motion.button>
									</div>

									{error ? (
										<div className="flex items-start gap-3 rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
											<XCircle className="mt-0.5 h-4 w-4 shrink-0" />
											<p>{error}</p>
										</div>
									) : null}
								</div>
							</SectionCard>
						</motion.div>

						<motion.div variants={itemVariants} className="space-y-4">
							<SectionCard
								title="Match Results"
								subtitle="Your output will appear here after the analysis runs."
								className="min-h-full"
							>
								{result ? (
									<div className="space-y-5">
										<div className="grid gap-4 sm:grid-cols-[minmax(0,190px)_1fr] sm:items-center">
											<div className="relative mx-auto w-44 sm:mx-0">
												<svg viewBox={`0 0 ${ringSize} ${ringSize}`} className="h-full w-full -rotate-90">
													<circle
														cx={ringSize / 2}
														cy={ringSize / 2}
														r={ringRadius}
														fill="none"
														stroke="rgba(255,255,255,0.08)"
														strokeWidth={ringStroke}
													/>
													<motion.circle
														cx={ringSize / 2}
														cy={ringSize / 2}
														r={ringRadius}
														fill="none"
														stroke={scoreRingColor(result.matchScore)}
														strokeWidth={ringStroke}
														strokeDasharray={ringCircumference}
														strokeDashoffset={ringOffset}
														strokeLinecap="round"
														initial={{ strokeDashoffset: ringCircumference }}
														animate={{ strokeDashoffset: ringOffset }}
														transition={{ duration: 0.9 }}
													/>
												</svg>
												<div className="absolute inset-0 flex flex-col items-center justify-center text-center">
													<div className="text-4xl font-semibold text-slate-900 sm:text-5xl">
														{Math.round(result.matchScore)}
													</div>
													<p className="mt-1 text-xs uppercase tracking-[0.3em] text-slate-500">/ 100</p>
												</div>
											</div>

											<div className="space-y-3">
												<div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm">
													<Target className="h-3.5 w-3.5 text-cyan-300" />
													{scoreLabel(result.matchScore)}
												</div>
												<p className="text-sm leading-6 text-slate-500">
													{formatCount(result.matchedKeywords)} of {result.analysis?.totalKeywordsInJD || 0} keyword signals matched across skills, experience, and projects.
												</p>
												<div className="rounded-3xl border border-slate-200 bg-white p-3 text-sm text-slate-600 shadow-sm">
													Matched keywords: <span className="text-slate-900">{formatCount(result.matchedKeywords)}</span> · Missing keywords: <span className="text-slate-900">{formatCount(result.missingKeywords)}</span>
												</div>
											</div>
										</div>

										<div className="grid gap-4 sm:grid-cols-2">
											<SectionCard title={`Matched Skills (${formatCount(result.matchedSkills)})`} subtitle="Skills already covered in the resume.">
												<div className="flex flex-wrap gap-2">
													{result.matchedSkills.length > 0 ? (
														result.matchedSkills.map((skill) => (
															<span key={skill} className={`rounded-full border px-3 py-1 text-xs font-medium ${chipStyles.matched}`}>
																{skill}
															</span>
														))
													) : (
														<p className="text-sm text-slate-400">No matched skills found.</p>
													)}
												</div>
											</SectionCard>

											<SectionCard title={`Missing Skills (${formatCount(result.missingSkills)})`} subtitle="Skills the job description asks for but the resume does not show.">
												<div className="flex flex-wrap gap-2">
													{result.missingSkills.length > 0 ? (
														result.missingSkills.map((skill) => (
															<span key={skill} className={`rounded-full border px-3 py-1 text-xs font-medium ${chipStyles.missing}`}>
																{skill}
															</span>
														))
													) : (
														<p className="text-sm text-slate-400">No missing skills detected.</p>
													)}
												</div>
											</SectionCard>
										</div>

										<SectionCard title={`Suggestions (${formatCount(result.suggestions)})`} subtitle="Actionable improvements generated from the comparison.">
											<div className="space-y-3">
												{result.suggestions.length > 0 ? (
													result.suggestions.map((suggestion) => (
														<div key={suggestion} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
															<Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
															<p className="leading-6">{suggestion}</p>
														</div>
													))
												) : (
													<p className="text-sm text-slate-400">No suggestions returned by the analyzer.</p>
												)}
											</div>
										</SectionCard>

										<SectionCard title={`Keyword Gaps (${formatCount(result.missingKeywords)})`} subtitle="Specific terms from the JD that are not represented in the resume.">
											<div className="flex flex-wrap gap-2">
												{result.missingKeywords.length > 0 ? (
													result.missingKeywords.map((keyword) => (
														<span key={keyword} className={`rounded-full border px-3 py-1 text-xs font-medium ${chipStyles.keyword}`}>
															{keyword}
														</span>
													))
												) : (
													<p className="text-sm text-slate-400">No keyword gaps detected.</p>
												)}
											</div>
										</SectionCard>
									</div>
									) : (
									<div className="flex min-h-112 flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-10 text-center shadow-sm">
										<div className="mb-4 rounded-full border border-cyan-200 bg-cyan-50 p-4 text-cyan-600">
											<CheckCircle2 className="h-7 w-7" />
										</div>
										<h3 className="text-xl font-semibold text-slate-900">Results will appear here</h3>
										<p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
											Paste a job description and analyze it to see the score, matched skills, missing skills, suggestions, and keyword gaps.
										</p>
										{!hasResume ? (
											<p className="mt-4 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-700">
												Resume data is required before match analysis can run.
											</p>
										) : null}
									</div>
								)}
							</SectionCard>
						</motion.div>
					</div>
				</div>
			</motion.div>
		</motion.div>
	);
};

export default JDMatcher;
