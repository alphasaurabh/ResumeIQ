"use client";

import { motion } from "framer-motion";
import { BarChart3, FileSearch, FileScan, Sparkles, Target, Zap } from "lucide-react";

const features = [
	{
		icon: BarChart3,
		title: "ATS Analysis",
		description: "Understand how your resume performs across formatting, skills, experience, projects, readability, and overall structure.",
		accent: "text-cyan-300",
		glow: "from-cyan-400/15 to-blue-500/10",
	},
	{
		icon: FileSearch,
		title: "JD Matching",
		description: "Compare your resume against a specific role and see the missing skills and keywords that matter most.",
		accent: "text-violet-300",
		glow: "from-violet-400/15 to-fuchsia-500/10",
	},
	{
		icon: Sparkles,
		title: "Resume Optimization",
		description: "Rewrite weak bullets with stronger verbs and clearer context while keeping every claim grounded in the original resume.",
		accent: "text-emerald-300",
		glow: "from-emerald-400/15 to-teal-500/10",
	},
	{
		icon: FileScan,
		title: "Parse Confidence",
		description: "See how completely the parser extracted your name, email, skills, projects, experience, education, and certifications.",
		accent: "text-amber-300",
		glow: "from-amber-400/15 to-orange-500/10",
	},
	{
		icon: Zap,
		title: "Resume Insights",
		description: "Get actionable warnings and section-level guidance so you know exactly what to improve next.",
		accent: "text-sky-300",
		glow: "from-sky-400/15 to-cyan-500/10",
	},
	{
		icon: Target,
		title: "Keyword Coverage",
		description: "See which role-specific terms are present, missing, or underused so the resume reads closer to the job you want.",
		accent: "text-amber-300",
		glow: "from-amber-400/15 to-yellow-500/10",
	},
];

const Features = () => {
	return (
		<section
			id="features"
			className="mx-auto w-full max-w-7xl px-6 pt-2 pb-20 sm:px-8 lg:px-12 lg:pt-4 lg:pb-24"
		>
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true, amount: 0.2 }}
				transition={{ duration: 0.6 }}
				className="max-w-2xl"
			>
				<p className="text-xs uppercase tracking-[0.24em] text-indigo-600">Features</p>
				<h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
					Everything you need to improve the resume you already have.
				</h2>
			</motion.div>

			<div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
				{features.map((feature, index) => {
					const Icon = feature.icon;
					return (
						<motion.div
							key={feature.title}
							initial={{ opacity: 0, y: 18 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true, amount: 0.2 }}
							transition={{ delay: index * 0.08, duration: 0.5 }}
							className="group rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
						>
							<div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 shadow-sm">
								<Icon className="h-5 w-5" />
							</div>
							<h3 className="mt-5 text-xl font-semibold text-slate-900">{feature.title}</h3>
							<p className="mt-3 text-sm leading-7 text-slate-500">{feature.description}</p>
						</motion.div>
					);
				})}
			</div>
		</section>
	);
};

export default Features;