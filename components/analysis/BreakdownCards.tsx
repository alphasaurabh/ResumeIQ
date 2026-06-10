"use client";

import { motion } from "framer-motion";
import {
	FileText,
	Code,
	FolderOpen,
	Briefcase,
	Eye,
	LucideIcon,
} from "lucide-react";

interface ScoreBreakdownCardProps {
	title: string;
	score: number;
	maxScore: number;
	icon: LucideIcon;
	delay?: number;
}

const ScoreBreakdownCard = ({
	title,
	score,
	maxScore,
	icon: Icon,
	delay = 0,
}: ScoreBreakdownCardProps) => {
	const percentage = (score / maxScore) * 100;

	const getStatusColor = (pct: number) => {
		if (pct >= 80) return "text-indigo-600";
		if (pct >= 60) return "text-cyan-600";
		if (pct >= 40) return "text-amber-600";
		return "text-rose-600";
	};

	const getProgressColor = (pct: number) => {
		if (pct >= 80) return "bg-indigo-600";
		if (pct >= 60) return "bg-cyan-500";
		if (pct >= 40) return "bg-amber-500";
		return "bg-rose-500";
	};

	const getBackgroundColor = (pct: number) => {
		if (pct >= 80) return "from-indigo-50 to-white";
		if (pct >= 60) return "from-cyan-50 to-white";
		if (pct >= 40) return "from-amber-50 to-white";
		return "from-rose-50 to-white";
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay, duration: 0.4 }}
			whileHover={{ translateY: -6, scale: 1.03 }}
			className={`group relative min-h-45 overflow-hidden rounded-3xl border border-slate-200 bg-linear-to-br ${getBackgroundColor(
				percentage
			)} p-4 shadow-sm transition-all duration-300 hover:shadow-md`}
		>
			{/* Soft glow effect on hover */}
			<div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-linear-to-br from-indigo-100 to-transparent blur-3xl opacity-0 pointer-events-none transition-opacity duration-500 group-hover:opacity-100" />

			{/* Content */}
			<div className="relative z-10 h-full flex flex-col text-left">
				{/* Header */}
				<div className="flex items-center gap-3 mb-6">
					<div className="shrink-0 flex h-12 w-12 items-center justify-center rounded-3xl bg-white shadow-sm border border-slate-200">
						<Icon className={`h-4 w-4 ${getStatusColor(percentage)}`} />
					</div>
					<h3 className="whitespace-normal text-xl font-semibold text-slate-900">
						{title}
					</h3>
				</div>

				{/* Score display */}
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: delay + 0.2 }}
					className="mb-3"
				>
					<p className={`text-2xl font-bold ${getStatusColor(percentage)}`}>
						{score}/{maxScore}
					</p>
					<p className="mt-0.5 text-xs text-slate-500">
						{Math.round(percentage)}%
					</p>
				</motion.div>

				{/* Progress bar */}
				<div className="flex-1 flex h-2 w-full items-end overflow-hidden rounded-full bg-slate-100">
					<motion.div
						initial={{ width: 0 }}
						animate={{ width: `${percentage}%` }}
						transition={{ delay: delay + 0.3, duration: 0.8 }}
						className={`h-full ${getProgressColor(
							percentage
						)} rounded-full shadow-lg transition-all`}
					/>
				</div>
			</div>
		</motion.div>
	);
};

interface BreakdownCardsProps {
	breakdown: {
		formatting?: number;
		skills?: number;
		projects?: number;
		experience?: number;
		readability?: number;
	};
	maxScores?: {
		formatting?: number;
		skills?: number;
		projects?: number;
		experience?: number;
		readability?: number;
	};
}

const BreakdownCards = ({
	breakdown,
	maxScores = {
		formatting: 20,
		skills: 20,
		projects: 20,
		experience: 15,
		readability: 15,
	},
}: BreakdownCardsProps) => {
	const cards = [
		{
			title: "Formatting",
			key: "formatting",
			icon: FileText,
			delay: 0.1,
		},
		{ title: "Skills", key: "skills", icon: Code, delay: 0.2 },
		{
			title: "Projects",
			key: "projects",
			icon: FolderOpen,
			delay: 0.3,
		},
		{
			title: "Experience",
			key: "experience",
			icon: Briefcase,
			delay: 0.4,
		},
		{
			title: "Readability",
			key: "readability",
			icon: Eye,
			delay: 0.5,
		},
	];

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ delay: 0.3 }}
			className="flex flex-col items-stretch gap-6"
		>
			<div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3">
				{cards.slice(0, 3).map((card) => (
					<ScoreBreakdownCard
						key={card.key}
						title={card.title}
						score={breakdown[card.key] || 0}
						maxScore={maxScores[card.key] || 20}
						icon={card.icon}
						delay={card.delay}
					/>
				))}
			</div>

			<div className="mx-auto grid w-full max-w-175 grid-cols-1 items-stretch gap-6 md:grid-cols-2">
				{cards.slice(3).map((card) => (
					<ScoreBreakdownCard
						key={card.key}
						title={card.title}
						score={breakdown[card.key] || 0}
						maxScore={maxScores[card.key] || 20}
						icon={card.icon}
						delay={card.delay}
					/>
				))}
			</div>
		</motion.div>
	);
};

export default BreakdownCards;
