"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

interface ParseConfidenceBreakdownItem {
	section: string;
	score: number;
	status: "parsed" | "partial" | "missing" | string;
}

interface ParseConfidenceData {
	parseScore?: number;
	breakdown?: ParseConfidenceBreakdownItem[];
	missingSections?: string[];
	parsedSections?: string[];
	warnings?: string[];
}

interface ParseConfidenceProps {
	data?: ParseConfidenceData | null;
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

const scoreLabel = (score: number) => {
	if (score >= 90) return "Excellent parse";
	if (score >= 75) return "Strong parse";
	if (score >= 55) return "Partial parse";
	return "Needs review";
};

const statusStyles = {
	parsed: {
		border: "border-emerald-200",
		bg: "bg-emerald-50",
		text: "text-emerald-700",
		badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
		accent: "#22c55e",
	},
	partial: {
		border: "border-amber-200",
		bg: "bg-amber-50",
		text: "text-amber-700",
		badge: "bg-amber-50 text-amber-700 border-amber-200",
		accent: "#f59e0b",
	},
	missing: {
		border: "border-rose-200",
		bg: "bg-rose-50",
		text: "text-rose-700",
		badge: "bg-rose-50 text-rose-700 border-rose-200",
		accent: "#f43f5e",
	},
} as const;

const statusFor = (status?: string) => {
	if (status === "parsed") return statusStyles.parsed;
	if (status === "partial") return statusStyles.partial;
	return statusStyles.missing;
};

const ParseConfidence = ({ data }: ParseConfidenceProps) => {
	if (!data) {
		return null;
	}

	const score = Math.max(0, Math.min(100, Math.round(data.parseScore || 0)));
	const breakdown = Array.isArray(data.breakdown) ? data.breakdown : [];
	const warnings = Array.isArray(data.warnings) ? data.warnings : [];

	const ringSize = 168;
	const ringStroke = 10;
	const ringRadius = (ringSize - ringStroke) / 2;
	const ringCircumference = 2 * Math.PI * ringRadius;
	const ringOffset = ringCircumference - (score / 100) * ringCircumference;

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
		hidden: { opacity: 0, y: 16 },
		visible: {
			opacity: 1,
			y: 0,
			transition: { duration: 0.45 },
		},
	};

	const scoreTone = score >= 90 ? "#22c55e" : score >= 75 ? "#38bdf8" : score >= 55 ? "#f59e0b" : "#fb7185";

	return (
		<motion.div
			variants={containerVariants}
			initial="hidden"
			animate="visible"
			className="w-full max-w-7xl mx-auto"
		>
			<motion.div
				variants={itemVariants}
				className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow"
			>
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.06),transparent_38%)] pointer-events-none opacity-30" />
				<div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/6 to-transparent" />

				<div className="relative z-10">
					<div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
						<div className="space-y-2">
							<div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-indigo-600">
								Parse Confidence
							</div>
							<h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
								Resume Parse Confidence
							</h2>
							<p className="max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
								How completely the uploaded resume was extracted into structured fields.
							</p>
						</div>
						<div className="rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow">
							{scoreLabel(score)}
						</div>
					</div>

					<div className="grid gap-6 lg:grid-cols-[minmax(0,280px)_1fr]">
						<motion.div variants={itemVariants} className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 min-h-80 shadow">
							<div className="relative z-10 flex h-full flex-col items-center justify-center gap-4 text-center">
								<div className="relative w-44 h-44">
									<svg viewBox={`0 0 ${ringSize} ${ringSize}`} className="h-full w-full -rotate-90">
										<circle
											cx={ringSize / 2}
											cy={ringSize / 2}
											r={ringRadius}
											fill="none"
											stroke="#E6EEF8"
											strokeWidth={ringStroke}
										/>
										<motion.circle
											cx={ringSize / 2}
											cy={ringSize / 2}
											r={ringRadius}
											fill="none"
											stroke={scoreTone}
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
											{score}%
										</div>
										<p className="mt-1 text-xs uppercase tracking-[0.3em] text-slate-500">Parsed</p>
									</div>
								</div>
								<p className="text-sm leading-6 text-slate-500">
									Higher scores mean the parser extracted more complete and structured resume data.
								</p>
							</div>
						</motion.div>

						<motion.div variants={itemVariants} className="space-y-4">
							<SectionCard
								title="Section Breakdown"
								subtitle="Each card reflects how fully that part of the resume was extracted."
							>
								<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
									{breakdown.map((item) => {
										const styles = statusFor(item.status);
										return (
											<div
												key={item.section}
												className={`rounded-3xl border border-slate-200 bg-white p-4 shadow-sm ${styles.border} ${styles.bg}`}
											>
												<div className="flex items-start justify-between gap-3">
													<div>
														<p className="text-sm font-semibold text-slate-900">{item.section}</p>
														<p className="mt-1 text-xs uppercase tracking-[0.22em] text-slate-500">{item.status}</p>
													</div>
													<div className={`rounded-full border px-3 py-1 text-xs font-semibold ${styles.badge}`}>
														{Math.round(item.score)}%
													</div>
												</div>
												<div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
													<motion.div
														initial={{ width: 0 }}
														animate={{ width: `${Math.max(0, Math.min(100, item.score))}%` }}
														transition={{ duration: 0.7 }}
														className="h-full rounded-full"
														style={{ backgroundColor: styles.accent }}
													/>
												</div>
											</div>
										);
									})}
								</div>
							</SectionCard>

							{warnings.length > 0 ? (
								<SectionCard
									title={`Warnings (${warnings.length})`}
									subtitle="Useful signals from the parser when extraction looks incomplete."
								>
									<div className="flex flex-wrap gap-2">
										{warnings.map((warning) => (
												<div key={warning} className="rounded-full border border-amber-200 bg-white px-3 py-2 text-xs text-amber-700 shadow-sm">
												{warning}
											</div>
										))}
									</div>
								</SectionCard>
							) : null}
						</motion.div>
					</div>
				</div>
			</motion.div>
		</motion.div>
	);
};

export default ParseConfidence;