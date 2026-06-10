"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const CTA = () => {
	return (
		<section className="mx-auto w-full max-w-7xl px-6 py-20 sm:px-8 lg:px-12 lg:py-24">
			<motion.div
				initial={{ opacity: 0, y: 22 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true, amount: 0.2 }}
				transition={{ duration: 0.6 }}
				className="relative overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-10 lg:p-14"
			>
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_top_center,rgba(99,102,241,0.06),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.05),transparent_30%)] pointer-events-none" />
				<div className="relative z-10 mx-auto max-w-3xl">
					<p className="text-xs uppercase tracking-[0.24em] text-indigo-600">CTA</p>
					<h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
						Start Improving Your Resume Today
					</h2>
					<p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-slate-500 sm:text-lg">
						Upload your resume, see what the parser understands, compare it to job descriptions, and improve the sections that need work.
					</p>
					<div className="mt-8">
						<Link href="/upload" className="inline-flex items-center justify-center gap-2 rounded-full bg-linear-to-r from-indigo-600 to-cyan-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:opacity-95">
							Upload Resume
							<ArrowRight className="h-4 w-4" />
						</Link>
					</div>
				</div>
			</motion.div>
		</section>
	);
};

export default CTA;