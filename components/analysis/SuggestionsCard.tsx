"use client";

import { motion } from "framer-motion";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface SuggestionsCardProps {
	suggestions: string[];
}

const SuggestionsCard = ({ suggestions = [] }: SuggestionsCardProps) => {
	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.08,
				delayChildren: 0.15,
			},
		},
	};

	const itemVariants = {
		hidden: { opacity: 0, y: 12 },
		visible: {
			opacity: 1,
			y: 0,
			transition: { duration: 0.4 },
		},
	};

	return (
		<>
			{suggestions.length > 0 ? (
				<motion.div
					variants={containerVariants}
					initial="hidden"
					animate="visible"
					className="space-y-3"
				>
					{suggestions.map((suggestion, index) => (
						<motion.div
							key={index}
							variants={itemVariants}
							whileHover={{ translateY: -4, scale: 1.02 }}
							className="group relative cursor-default overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300"
						>
							{/* Hover glow */}
							<div className="absolute -top-12 -right-12 h-24 w-24 rounded-full bg-amber-100 blur-2xl opacity-0 pointer-events-none transition-opacity duration-500 group-hover:opacity-100" />

							{/* Content */}
							<div className="relative z-10 flex items-start gap-3">
								<AlertCircle className="mt-0.5 h-4 w-4 flex-none shrink-0 text-amber-500" />
								<p className="text-sm leading-relaxed text-slate-500">
									{suggestion}
								</p>
							</div>
						</motion.div>
					))}
				</motion.div>
			) : (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.15 }}
					className="flex flex-col items-center justify-center py-8"
				>
					<CheckCircle2 className="mb-2 h-10 w-10 text-emerald-600" />
					<p className="text-center text-sm text-slate-500">
						No suggestions needed.
						<br />
						Excellent work!
					</p>
				</motion.div>
			)}
		</>
	);
};

export default SuggestionsCard;
