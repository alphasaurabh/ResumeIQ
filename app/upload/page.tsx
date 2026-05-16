import UploadZone from "../../components/upload/UploadZone";

const UploadPage = () => {
	return (
		<main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-slate-950 px-4 py-20 sm:px-6">
			<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(14,116,144,0.28),transparent_40%),radial-gradient(circle_at_85%_75%,rgba(37,99,235,0.2),transparent_35%),linear-gradient(to_bottom,rgba(15,23,42,0.75),rgba(2,6,23,0.95))]" />
			<div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[42px_42px]" />

			<section className="relative z-10 mx-auto w-full max-w-5xl">
				<div className="mb-10 text-center sm:mb-12">
					<p className="mb-3 inline-flex items-center rounded-full border border-cyan-200/20 bg-cyan-400/10 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.22em] text-cyan-200">
						ResumeIQ V1 Upload
					</p>
					<h1 className="mx-auto max-w-3xl text-balance text-4xl font-semibold leading-tight text-white sm:text-5xl">
						Turn Your Resume Into Structured Insight In Seconds
					</h1>
					<p className="mx-auto mt-4 max-w-2xl text-pretty text-sm text-slate-300 sm:text-base">
						Upload your file once and preview clean extracted data instantly.
						This flow is intentionally upload-only for V1.
					</p>
				</div>

				<UploadZone />
			</section>
		</main>
	);
};

export default UploadPage;
