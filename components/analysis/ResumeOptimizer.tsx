"use client";

import type { ReactNode } from "react";
import { useMemo } from "react";
import { motion } from "framer-motion";
import {
	ArrowRight,
	BadgeCheck,
	BrainCircuit,
	WandSparkles,
} from "lucide-react";
import optimizeResume from "../../lib/optimizer/resumeOptimizer";
import type { MatchResult as JDMatchResult } from "./JDMatcher";

interface ATSData {
	overall?: number;
	breakdown?: {
		formatting?: number;
		skills?: number;
		projects?: number;
		experience?: number;
		readability?: number;
	};
}

type JDMatchData = JDMatchResult | Record<string, unknown>;

interface OptimizationReport {
	optimizedBullets: Array<{
		section?: string;
		itemIndex?: number;
		bulletIndex?: number;
		original?: string;
		optimized?: string;
		reason?: string;
	}>;
	keywordSuggestions: string[];
	weakSections: Array<{
		section?: string;
		score?: number;
		reason?: string;
	}>;
	improvements: string[];
}

interface ResumeOptimizerProps {
 	parsedData?: Record<string, any> | null;
 	ats?: ATSData | null;
 	jdMatchData?: JDMatchData | null;
}

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
	<div className={`rounded-3xl border border-slate-200 bg-white p-5 shadow ${className}`}>
		<div className="mb-4">
			<h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-900">{title}</h3>
			{subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
		</div>
		{children}
	</div>
);

const formatCount = (value?: unknown[]) => (Array.isArray(value) ? value.length : 0);

const ResumeOptimizer = ({ parsedData, ats, jdMatchData }: ResumeOptimizerProps) => {
	const optimizerReport = useMemo<OptimizationReport | null>(() => {
		if (!parsedData || !jdMatchData) {
			return null;
		}

		return optimizeResume(parsedData, jdMatchData) as OptimizationReport;
	}, [parsedData, jdMatchData]);

	if (!parsedData || !jdMatchData || !optimizerReport) {
		return null;
	}

	const { optimizedBullets, keywordSuggestions, weakSections, improvements } = optimizerReport;

	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.08,
				delayChildren: 0.08,
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

	return (
		<motion.div
			variants={containerVariants}
			initial="hidden"
			animate="visible"
			className="w-full max-w-7xl mx-auto"
		>
			<motion.div
				variants={itemVariants}
				className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow sm:p-6 md:p-8"
			>
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.04),transparent_38%)] pointer-events-none opacity-20" />
				<div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-slate-200 to-transparent" />

				<div className="relative z-10">
					<div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
						<div className="space-y-2">
							<div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-indigo-600">
								<BrainCircuit className="h-3.5 w-3.5" />
								Resume Optimizer
							</div>
							<h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
								Optimizer Recommendations
							</h2>
								<p className="max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
								Rule-based guidance built from the parsed resume, ATS output, and JD match results already in the workspace.
							</p>
						</div>
						<div className="flex flex-wrap gap-2">
							{typeof ats?.overall === "number" ? (
								<div className="rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
									ATS {Math.round(ats.overall)}
								</div>
							) : null}
							<div className="rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
								JD match {Math.round(Number((jdMatchData as any)?.matchScore) || 0)}
							</div>
						</div>
					</div>

					<div className="grid gap-6 lg:grid-cols-2">
						<motion.div variants={itemVariants} className="space-y-4">
							<SectionCard
								title={`Weak Sections (${formatCount(weakSections)})`}
								subtitle="Areas that need stronger evidence or fuller descriptions."
							>
								<div className="space-y-3">
									{weakSections.length > 0 ? (
										weakSections.map((item, index) => (
											<div key={`${item.section || "section"}-${index}`} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
												<div className="flex items-center justify-between gap-3">
													<p className="text-sm font-semibold capitalize text-slate-900">{item.section || "Section"}</p>
													<span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600">
														Score {Math.round(item.score || 0)}
													</span>
												</div>
												<p className="mt-2 text-sm leading-6 text-slate-500">{item.reason || "No reason provided."}</p>
											</div>
										))
									) : (
										<div className="rounded-3xl border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-sm">
											No weak sections detected from the current resume and JD match data.
										</div>
									)}
								</div>
							</SectionCard>

							<SectionCard
								title={`Keyword Suggestions (${formatCount(keywordSuggestions)})`}
								subtitle="Rewrite directions tied to missing JD terms."
							>
										<div className="flex flex-wrap gap-2">
											{keywordSuggestions.length > 0 ? (
										keywordSuggestions.map((suggestion, index) => (
													<div key={`${suggestion}-${index}`} className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-2 text-xs leading-5 text-cyan-700 shadow-sm">
												{suggestion}
											</div>
										))
									) : (
												<p className="text-sm text-slate-500">No keyword suggestions returned.</p>
									)}
								</div>
							</SectionCard>
						</motion.div>

						<motion.div variants={itemVariants} className="space-y-4">
							<SectionCard
								title={`Improved Bullet Suggestions (${formatCount(optimizedBullets)})`}
								subtitle="Existing bullets rewritten with stronger verbs and tighter context."
							>
								<div className="space-y-3">
									{optimizedBullets.length > 0 ? (
										optimizedBullets.map((item, index) => (
												<div key={`${item.original || "bullet"}-${index}`} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
													<div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.16em] text-slate-500">
														<WandSparkles className="h-3.5 w-3.5 text-amber-500" />
													<span>{item.section || "Bullet"}</span>
												</div>
													<p className="mt-3 text-sm leading-6 text-slate-500">Original: {item.original || ""}</p>
													<p className="mt-2 text-sm leading-6 text-slate-700">Optimized: {item.optimized || ""}</p>
													<div className="mt-3 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs text-amber-700">
														<ArrowRight className="h-3.5 w-3.5 text-amber-700" />
													{item.reason || "Rule-based rewrite"}
												</div>
											</div>
										))
									) : (
										<div className="rounded-3xl border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-sm">
											No bullet rewrites were needed from the current resume content.
										</div>
									)}
								</div>
							</SectionCard>

							<SectionCard
								title={`Improvement Cards (${formatCount(improvements)})`}
								subtitle="Actionable next edits, constrained to the existing resume content."
							>
								<div className="grid gap-3 sm:grid-cols-2">
									{improvements.length > 0 ? (
										improvements.map((improvement, index) => (
											<div key={`${improvement}-${index}`} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
												<div className="mb-3 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600">
													<BadgeCheck className="h-3.5 w-3.5" />
													Improvement
												</div>
												<p className="text-sm leading-6 text-slate-500">{improvement}</p>
											</div>
										))
									) : (
										<div className="rounded-3xl border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-sm sm:col-span-2">
											No improvement cards were generated for the current input.
										</div>
									)}
								</div>
							</SectionCard>
						</motion.div>
					</div>
				</div>
			</motion.div>
		</motion.div>
	);
};

export default ResumeOptimizer;