"use client";

const Footer = () => {
	return (
		<footer className="border-t border-slate-200 bg-white">
			<div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-3 px-6 py-8 text-center sm:px-8 lg:px-12">
				<p className="text-sm text-slate-500">
					© 2026{" "}
					<a
						href="https://saurabhdev.me"
						target="_blank"
						rel="noopener noreferrer"
						className="font-semibold text-slate-900 transition hover:text-indigo-600"
					>
						Saurabh Chandravanshi
					</a>
					. All rights reserved.
				</p>
			</div>
		</footer>
	);
};

export default Footer;