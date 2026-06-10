"use client";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

const navItems = [
	{ label: "Features", href: "#features" },
	{ label: "How it Works", href: "#workflow" },
];

const Navbar = () => {
	return (
		<motion.header
			initial={{ opacity: 0, y: -16 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
			className="sticky top-0 z-50 border-b border-slate-200 bg-white/85 backdrop-blur-xl"
		>
			<div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4 sm:px-8 lg:px-12">
				<Link href="/" className="flex items-center gap-3">
					<img
  src="/favicon.ico"
  alt="ResumeIQ"
  className="h-10 w-10 rounded-xl"
/>
					<div>
						<p className="text-sm font-semibold tracking-[0.12em] text-slate-900">ResumeIQ</p>
						<p className="text-xs text-slate-500">AI resume intelligence</p>
					</div>
				</Link>

				<nav className="hidden items-center gap-8 md:flex">
					{navItems.map((item) => (
						<a key={item.label} href={item.href} className="text-sm text-slate-500 transition hover:text-slate-900">
							{item.label}
						</a>
					))}
				</nav>

				<a
					href="https://github.com/alphasaurabh/ResumeIQ"
					target="_blank"
					rel="noopener noreferrer"
					className="inline-flex cursor-pointer items-center justify-center rounded-full bg-linear-to-r from-indigo-600 to-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-white"
				>
					⭐ Star on GitHub
				</a>
			</div>
		</motion.header>
	);
};

export default Navbar;
