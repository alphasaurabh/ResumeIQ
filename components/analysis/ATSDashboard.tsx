"use client";

import { motion } from "framer-motion";
import ATSScoreCircle from "./ATSScoreCircle";
import BreakdownCards from "./BreakdownCards";
import SuggestionsCard from "./SuggestionsCard";

interface ATSResult {
	overall: number;
	breakdown: {
		formatting?: number;
		skills?: number;
		projects?: number;
		experience?: number;
		readability?: number;
	};
	suggestions: string[];
}

interface ATSDashboardProps {
	result?: ATSResult;
	ats?: ATSResult;
	isLoading?: boolean;
}

const ATSDashboard = ({
	result,
	ats,
	isLoading = false,
}: ATSDashboardProps) => {
	const data = result || ats;

	if (!data) {
		return null;
	}

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-20">
				<motion.div
					animate={{ rotate: 360 }}
					transition={{
						duration: 2,
						repeat: Infinity,
						ease: "linear",
					}}
					className="h-12 w-12 rounded-full border-4 border-slate-200 border-t-cyan-400"
				/>
			</div>
		);
	}

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

	const sectionVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: {
			opacity: 1,
			y: 0,
			transition: { duration: 0.5 },
		},
	};

	return (
		<motion.div
			variants={containerVariants}
			initial="hidden"
			animate="visible"
			className="w-full max-w-6xl mx-auto"
		>
			{/* Main dashboard container */}
			<motion.div
				variants={sectionVariants}
				className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-lg md:p-10"
			>
				{/* Subtle accent overlays */}
				<div className="absolute inset-0 rounded-3xl bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.05),transparent_30%)] pointer-events-none opacity-30" />

				{/* Content */}
				<div className="relative z-10">
					{/* SECTION 1: Score + Improvements (2-column grid) */}
					<div className="grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-8 mb-6">
						{/* Left column: ATS Hero Card (40%) */}
						<motion.div
							variants={sectionVariants}
							className="md:col-span-2"
						>
							<div className="relative h-full min-h-80 overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
								<div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(99,102,241,0.03),transparent)] pointer-events-none" />

								{/* Hero content - centered and compact */}
								<div className="relative z-10 h-full flex flex-col items-center justify-center gap-2">
									<ATSScoreCircle score={data.overall} maxScore={100} />
								</div>
							</div>
						</motion.div>

						{/* Right column: Improvement Tips (60%) */}
						<motion.div
							variants={sectionVariants}
							className="md:col-span-3"
						>
								<div className="relative h-full min-h-80 overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
									<div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(99,102,241,0.02),transparent)] pointer-events-none" />

								{/* Improvement panel content */}
								<div className="relative z-10 h-full flex flex-col">
									<div className="mb-5">
										<h2 className="text-lg font-semibold text-slate-900">
											Improvement Tips
										</h2>
										<p className="mt-1 text-sm text-slate-500">
											Ways to improve your resume score
										</p>
									</div>
									<div className="flex-1 overflow-y-auto">
										<SuggestionsCard suggestions={data.suggestions} />
									</div>
								</div>
							</div>
						</motion.div>
					</div>

					{/* Subtle divider */}
					<div className="my-6 h-px bg-slate-200" />

					{/* SECTION 2: Score Breakdown */}
					<motion.div variants={sectionVariants} className="pt-2">
						<h2 className="mb-6 text-base font-semibold text-slate-900">
							Score Breakdown
						</h2>
						<BreakdownCards breakdown={data.breakdown} />
					</motion.div>
				</div>
			</motion.div>
		</motion.div>
	);
};

export default ATSDashboard;
