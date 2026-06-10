"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

interface ATSScoreCircleProps {
	score: number;
	maxScore?: number;
}

const ATSScoreCircle = ({ score, maxScore = 100 }: ATSScoreCircleProps) => {
	const percentage = Math.min((score / maxScore) * 100, 100);
	const data = [{ value: percentage }, { value: 100 - percentage }];

	const getColor = (value: number) => {
		if (value >= 80) return "#6366f1";
		if (value >= 60) return "#06b6d4";
		if (value >= 40) return "#f59e0b";
		return "#f43f5e";
	};

	const arcColor = getColor(percentage);

	const getStatusBadge = (value: number) => {
		if (value >= 86) {
			return { label: "Excellent", bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200" };
		} else if (value >= 71) {
			return { label: "Good", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" };
		} else if (value >= 41) {
			return { label: "Average", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" };
		} else {
			return { label: "Poor", bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" };
		}
	};

	const badge = getStatusBadge(percentage);

	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.9 }}
			animate={{ opacity: 1, scale: 1 }}
			transition={{ duration: 0.6 }}
			className="flex flex-col items-center justify-center gap-4"
		>
			{/* Hero chart - 220x220 */}
			<div className="relative w-56 h-56">
				<ResponsiveContainer width="100%" height="100%">
					<PieChart>
						<Pie
							data={data}
							cx="50%"
							cy="50%"
							innerRadius={95}
							outerRadius={110}
							startAngle={90}
							endAngle={-270}
							dataKey="value"
						>
							<Cell fill={arcColor} />
							<Cell fill="#E2E8F0" />
						</Pie>
					</PieChart>
				</ResponsiveContainer>

				{/* Score overlay - centered inside chart */}
				<div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.3 }}
						className="text-center"
					>
						<p className="text-6xl font-bold text-slate-900 leading-none">
							<motion.span
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ delay: 0.4 }}
							>
								{Math.round(score)}
							</motion.span>
						</p>
						<p className="mt-1 text-xs text-slate-500">/ {maxScore}</p>
					</motion.div>
				</div>
			</div>

			{/* Badge section - compact */}
			<motion.div
				initial={{ opacity: 0, y: 5 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.5 }}
				className="text-center space-y-2"
			>
				<p className="text-xs font-medium uppercase tracking-wide text-slate-500">ATS Score</p>
				<motion.div
					initial={{ opacity: 0, scale: 0.9 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ delay: 0.6 }}
					whileHover={{ scale: 1.05 }}
					className={`inline-flex items-center px-4 py-2 rounded-full border text-sm font-semibold ${badge.bg} ${badge.text} ${badge.border} transition-all`}
				>
					{badge.label}
				</motion.div>
			</motion.div>
		</motion.div>
	);
};

export default ATSScoreCircle;
