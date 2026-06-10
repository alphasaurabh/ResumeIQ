import UploadZone from "../../components/upload/UploadZone";

const UploadPage = () => {
	return (
		    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#F8FAFC] px-4 py-20 text-slate-900 sm:px-6">
			    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(99,102,241,0.06),transparent_30%),radial-gradient(circle_at_80%_80%,rgba(6,182,212,0.04),transparent_30%)] opacity-40" />
			    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.02)_1px,transparent_1px),linear-gradient(to_right,rgba(15,23,42,0.02)_1px,transparent_1px)] bg-size-[42px_42px] opacity-20" />

			<section className="relative z-10 mx-auto w-full max-w-275 px-6">
				<div className="mx-auto flex max-w-212.5 flex-col items-center text-center">
					<p className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-medium uppercase tracking-[0.22em] text-indigo-600 shadow-lg">
						ResumeIQ V1 Upload
					</p>
					<h1 className="mx-auto mt-6 max-w-3xl text-balance text-4xl font-semibold leading-tight text-slate-900 sm:text-5xl">
						Turn Your Resume Into Structured Insight In Seconds
					</h1>
					<p className="mx-auto mt-6 max-w-175 text-pretty text-sm text-slate-500 sm:text-base">
						Upload your file once and preview clean extracted data instantly.
						This flow is intentionally upload-only for V1.
					</p>
				</div>

				<div className="mt-10 w-full">
					<UploadZone />
				</div>
			</section>
		</main>
	);
};

export default UploadPage;
