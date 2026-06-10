"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

interface DashboardPreviewProps {
	compact?: boolean;
}

const DashboardPreview = ({ compact = false }: DashboardPreviewProps) => {
	const preview = (
		<motion.div
			initial={{ opacity: 0, y: 18 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, amount: 0.2 }}
			transition={{ duration: 0.7 }}
			className="relative mx-auto w-full max-w-130 aspect-4/5 overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-lg"
		>
			<div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.05),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.04),transparent_30%)] pointer-events-none" />
			<div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-slate-200 to-transparent" />
			<div className="relative z-10 flex h-full min-w-0 flex-col justify-between p-6 sm:p-7">
				<div className="min-w-0">
					<p className="text-sm uppercase tracking-[0.24em] text-indigo-600">Live dashboard</p>
					<h3 className="mt-4 max-w-sm text-4xl font-semibold tracking-tight text-slate-900 wrap-break-word">
						Resume analysis in one focused view.
					</h3>
				</div>

				<div className="grid min-w-0 gap-4 py-8">
					<div className="grid grid-cols-2 gap-4 min-w-0">
						<div className="min-w-0 accent-tile tile-emerald overflow-hidden">
							<p className="text-sm font-medium text-emerald-700">ATS Score</p>
							<p className="mt-3 text-4xl font-semibold tracking-tight text-slate-900 wrap-break-word">92</p>
						</div>
						<div className="min-w-0 accent-tile tile-cyan overflow-hidden">
							<p className="text-sm font-medium text-cyan-700">JD Match</p>
							<p className="mt-3 text-4xl font-semibold tracking-tight text-slate-900 wrap-break-word">87%</p>
						</div>
					</div>

					<div className="grid grid-cols-2 gap-3 min-w-0">
						<div className="min-w-0 accent-tile tile-amber overflow-hidden">
							<p className="text-sm font-medium text-amber-700">Suggestions</p>
							<p className="mt-2 text-2xl font-semibold text-slate-900 wrap-break-word">5</p>
						</div>
						<div className="min-w-0 accent-tile tile-violet overflow-hidden">
							<p className="text-sm font-medium text-violet-700">Optimizer</p>
							<p className="mt-2 text-2xl font-semibold text-slate-900 wrap-break-word">Active</p>
						</div>
					</div>
				</div>

					<div className="flex items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white px-4 py-4 min-w-0 overflow-hidden shadow-sm">
					<div className="min-w-0">
						<p className="text-sm text-slate-500">Parse Confidence</p>
						<p className="mt-1 text-2xl font-semibold text-slate-900 wrap-break-word">92% Parsed</p>
					</div>
						<div className="rounded-full border border-slate-200 bg-slate-50 p-3 text-indigo-600 shrink-0">
						<ArrowUpRight className="h-5 w-5" />
					</div>
				</div>
			</div>
		</motion.div>
	);

	if (compact) {
		return preview;
	}

	return (
		<motion.section
			id="dashboard-preview"
			initial={{ opacity: 0, y: 20 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, amount: 0.2 }}
			transition={{ duration: 0.6 }}
			className="mx-auto w-full max-w-7xl px-6 py-20 sm:px-8 lg:px-12 lg:py-28"
		>
			<div className="mx-auto w-full max-w-130">{preview}</div>
		</motion.section>
	);
};

export default DashboardPreview;