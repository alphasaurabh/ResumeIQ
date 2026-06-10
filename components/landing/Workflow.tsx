"use client";

import { motion } from "framer-motion";
import { ArrowRight, CircleDot, Upload, WandSparkles, Search } from "lucide-react";

const steps = [
	{ icon: Upload, title: "Upload Resume", description: "Drop in a PDF or DOCX and let the parser structure the content automatically.", accent: "from-cyan-400/15 to-blue-500/10", iconClass: "text-cyan-300" },
	{ icon: CircleDot, title: "Analyze", description: "Review ATS scoring and parse confidence to understand how well the resume was extracted.", accent: "from-violet-400/15 to-fuchsia-500/10", iconClass: "text-violet-300" },
	{ icon: Search, title: "Match Jobs", description: "Compare the resume against a target job description and surface missing keywords.", accent: "from-emerald-400/15 to-teal-500/10", iconClass: "text-emerald-300" },
	{ icon: WandSparkles, title: "Optimize Resume", description: "Apply conservative rewrites and section guidance to strengthen weak areas without inventing anything.", accent: "from-amber-400/15 to-orange-500/10", iconClass: "text-amber-300" },
];

const Workflow = () => {
	return (
		<section
			id="workflow"
			className="mx-auto w-full max-w-7xl px-6 pt-4 pb-20 sm:px-8 lg:px-12 lg:pt-6 lg:pb-24"
		>
			<div className="max-w-2xl">
				<p className="text-xs uppercase tracking-[0.24em] text-indigo-600">How it Works</p>
				<h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
					A simple workflow built around the resume you already wrote.
				</h2>
			</div>

			<div className="mt-10 grid gap-4 lg:grid-cols-4">
				{steps.map((step, index) => {
					const Icon = step.icon;
					return (
						<motion.div
							key={step.title}
							initial={{ opacity: 0, y: 16 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true, amount: 0.25 }}
							transition={{ delay: index * 0.08, duration: 0.45 }}
							className="relative rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm"
						>
							<div className="flex items-center justify-between gap-3">
								<div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 shadow-sm">
									<Icon className="h-5 w-5 text-indigo-600" />
								</div>
								{index < steps.length - 1 ? <ArrowRight className="hidden h-4 w-4 text-slate-300 lg:block" /> : null}
							</div>
							<p className="mt-6 text-xs uppercase tracking-[0.2em] text-slate-500">Step {index + 1}</p>
							<h3 className="mt-3 text-xl font-semibold text-slate-900">{step.title}</h3>
							<p className="mt-3 text-sm leading-7 text-slate-500">{step.description}</p>
						</motion.div>
					);
				})}
			</div>
		</section>
	);
};

export default Workflow;