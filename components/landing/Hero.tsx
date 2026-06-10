"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import DashboardPreview from "./DashboardPreview";

const Hero = () => {
	return (
		<section className="mx-auto w-full max-w-7xl px-6 pt-4 pb-18 sm:px-8 lg:px-12 lg:pt-4 lg:pb-24">
			<div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
				<motion.div
					initial={{ opacity: 0, y: 24 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.65 }}
					className="max-w-3xl"
				>
					<div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/30 bg-white/80 px-4 py-2 text-xs font-medium uppercase tracking-[0.24em] text-slate-700 shadow-[0_12px_40px_rgba(15,23,42,0.05)] backdrop-blur-xl">
						<Sparkles className="h-3.5 w-3.5 text-emerald-500" />
						Premium AI resume analysis
					</div>

					<h1 className="mt-7 max-w-3xl text-5xl font-semibold tracking-tight text-slate-900 sm:text-6xl lg:text-7xl xl:text-[5.2rem] xl:leading-[1.02]">
						AI Resume Analysis That Actually Helps You <span className="bg-linear-to-r from-violet-600 via-cyan-500 to-emerald-500 bg-clip-text text-transparent">Get Interviews</span>
					</h1>

					<p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
						Analyze your resume, improve ATS performance, match against job descriptions, and optimize weak sections instantly.
					</p>

					<div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
						<Link
							href="/upload"
							className="inline-flex items-center justify-center gap-2 rounded-full bg-linear-to-r from-emerald-400 via-cyan-400 to-blue-500 px-6 py-3.5 text-sm font-semibold text-slate-950 shadow-[0_18px_40px_rgba(16,185,129,0.18)] transition hover:from-emerald-300 hover:via-cyan-300 hover:to-blue-400"
						>
							Upload Resume
							<ArrowRight className="h-4 w-4" />
						</Link>
					</div>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, scale: 0.96, y: 18 }}
					animate={{ opacity: 1, scale: 1, y: 0 }}
					transition={{ duration: 0.8, delay: 0.1 }}
					className="relative"
				>
					<div className="absolute -left-8 top-8 h-28 w-28 rounded-full bg-emerald-400/15 blur-3xl" />
					<div className="absolute -right-6 bottom-6 h-36 w-36 rounded-full bg-violet-500/15 blur-3xl" />
					<div className="relative mx-auto flex w-full max-w-130 items-center justify-center overflow-hidden rounded-4xl border border-slate-200/70 bg-white/90 p-4 shadow-[0_28px_100px_rgba(15,23,42,0.12)] backdrop-blur-3xl sm:p-5">
						<div className="w-full">
							<DashboardPreview compact />
						</div>
					</div>
				</motion.div>
			</div>
		</section>
	);
};

export default Hero;