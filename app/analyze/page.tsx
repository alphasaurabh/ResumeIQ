"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import ATSDashboard from "../../components/analysis/ATSDashboard";
import JDMatcher from "../../components/analysis/JDMatcher";
import useResumeStore from "../../store/resumeStore";

export default function AnalyzePage() {
	const parsedData = useResumeStore((state) => state.parsedData);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return null;
	}

	// Use actual parsed data if available, otherwise use sample
	const sampleResult = {
		overall: 59,
		breakdown: {
			formatting: 15,
			skills: 16,
			projects: 14,
			experience: 9,
			readability: 12,
		},
		suggestions: [
			"Add measurable metrics to your experience descriptions",
			"Use stronger action verbs like 'Built', 'Developed', 'Optimized'",
			"Expand project descriptions with more technical details",
			"Add more role-specific skills relevant to your target position",
		],
	};

	const atsResult = parsedData?.ats || sampleResult;
	const resume = parsedData || {};

	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.1,
				delayChildren: 0.05,
			},
		},
	};

	const sectionVariants: any = {
		hidden: { opacity: 0, y: 20 },
		visible: {
			opacity: 1,
			y: 0,
			transition: { duration: 0.5 },
		},
	};

	return (
		<main className="relative min-h-screen overflow-hidden bg-[#F8FAFC] px-4 py-12 text-slate-900 sm:px-6 lg:px-8">
			<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.06),transparent_28%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.05),transparent_24%)]" />
			<div className="relative mx-auto flex w-full max-w-[1400px] flex-col gap-8">
				<div className="max-w-3xl space-y-3">
					<p className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-indigo-600 shadow-sm">
						Analyze
					</p>
					<h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
						Resume intelligence in one clean workspace.
					</h1>
					<p className="max-w-2xl text-base leading-7 text-slate-500 sm:text-lg">
						Review ATS score, parse quality, job matching, and optimization guidance in a single premium product flow.
					</p>
				</div>

				<motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
					<motion.div variants={sectionVariants}>
						<ATSDashboard result={atsResult} />
					</motion.div>

					<motion.div variants={sectionVariants} className="h-px bg-slate-200" />

					<motion.div variants={sectionVariants}>
						<JDMatcher resume={resume} />
					</motion.div>
				</motion.div>
			</div>
		</main>
	);
}
