"use client";

import { useCallback, useMemo } from "react";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";
import {
	CheckCircle2,
	FileText,
	Loader2,
	Trash2,
	UploadCloud,
} from "lucide-react";
import useResumeStore from "../../store/resumeStore";

const acceptedFileTypes = {
	"application/pdf": [".pdf"],
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
		".docx",
	],
};

const formatFileSize = (bytes: number) => {
	if (!bytes) {
		return "0 B";
	}

	const units = ["B", "KB", "MB", "GB"];
	const size = Math.floor(Math.log(bytes) / Math.log(1024));
	const normalizedSize = bytes / Math.pow(1024, size);

	return `${normalizedSize.toFixed(normalizedSize >= 10 ? 0 : 1)} ${units[size]}`;
};

const UploadZone = () => {
	const {
		selectedFile,
		isUploading,
		uploadProgress,
		parsedData,
		uploadError,
		setIsUploading,
		setUploadProgress,
		setParsedData,
		setSelectedFile,
		setUploadError,
		clearUploadedFile,
	} = useResumeStore();

	const parseResume = useCallback(
		async (file: File) => {
			setIsUploading(true);
			setUploadProgress(0);
			setParsedData(null);
			setUploadError("");

			try {
				const formData = new FormData();
				formData.append("file", file);

				const response = await fetch("/api/upload", {
					method: "POST",
					body: formData,
				});

				const responseJson = await response.json();

				if (!response.ok || !responseJson?.success) {
					throw new Error(responseJson?.error || "Failed to parse resume.");
				}

				setParsedData(responseJson?.data || null);
				setUploadProgress(100);
			} catch (error) {
				setUploadError(
					error instanceof Error ? error.message : "Failed to parse resume."
				);
				setUploadProgress(0);
			} finally {
				setIsUploading(false);
			}
		},
		[setIsUploading, setParsedData, setUploadError, setUploadProgress]
	);

	const onDropAccepted = useCallback(
		(acceptedFiles: File[]) => {
			const file = acceptedFiles?.[0];

			if (!file) {
				return;
			}

			setSelectedFile(file);
			parseResume(file);
		},
		[setSelectedFile, parseResume]
	);

	const onDropRejected = useCallback(() => {
		setUploadError("Only PDF and DOCX files are supported.");
	}, [setUploadError]);

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDropAccepted,
		onDropRejected,
		accept: acceptedFileTypes,
		multiple: false,
		disabled: isUploading,
	});

	const projects = Array.isArray(parsedData?.projects) ? parsedData.projects : [];
	const skills = Array.isArray(parsedData?.skills) ? parsedData.skills : [];
	const education = Array.isArray(parsedData?.education) ? parsedData.education : [];
	const experience = Array.isArray(parsedData?.experience) ? parsedData.experience : [];

	const fileTypeLabel = useMemo(() => {
		if (!selectedFile) {
			return "-";
		}

		const extension = selectedFile.name.split(".").pop()?.toUpperCase();
		return extension ? extension : selectedFile.type || "Unknown";
	}, [selectedFile]);

	return (
		<motion.section
			initial={{ opacity: 0, y: 28 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6, ease: "easeOut" }}
			className="w-full max-w-4xl"
		>
			<motion.div
				whileHover={{ y: -4 }}
				transition={{ type: "spring", stiffness: 260, damping: 20 }}
				className="rounded-3xl border border-white/15 bg-slate-950/40 p-6 shadow-[0_0_60px_-20px_rgba(34,211,238,0.35)] backdrop-blur-xl sm:p-8"
			>
				<div
					{...getRootProps()}
					className={`group relative cursor-pointer overflow-hidden rounded-2xl border border-dashed p-8 text-center transition-all duration-300 sm:p-12 ${
						isDragActive
							? "border-cyan-300/90 bg-cyan-400/10"
							: "border-white/20 bg-slate-900/40 hover:border-cyan-300/65 hover:bg-slate-900/55"
					} ${isUploading ? "cursor-not-allowed opacity-90" : ""}`}
				>
					<input {...getInputProps()} />

					<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.18),transparent_45%),radial-gradient(circle_at_80%_80%,rgba(59,130,246,0.16),transparent_40%)] opacity-80" />

					<div className="relative z-10 flex flex-col items-center gap-4">
						<div className="rounded-full border border-white/20 bg-slate-900/60 p-4">
							<UploadCloud className="h-10 w-10 text-cyan-300" />
						</div>

						<div>
							<p className="text-xl font-semibold text-white sm:text-2xl">
								{isDragActive
									? "Drop your resume here"
									: "Upload your resume to begin"}
							</p>
							<p className="mt-2 text-sm text-slate-300">
								Drag and drop a file, or click to browse. PDF and DOCX only.
							</p>
						</div>
					</div>
				</div>

				{uploadError ? (
					<p className="mt-4 rounded-lg border border-rose-400/30 bg-rose-500/10 px-4 py-2 text-sm text-rose-200">
						{uploadError}
					</p>
				) : null}

				{selectedFile ? (
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.25 }}
						className="mt-6 rounded-2xl border border-white/15 bg-slate-900/55 p-5"
					>
						<div className="flex flex-wrap items-start justify-between gap-4">
							<div className="space-y-2">
								<div className="flex items-center gap-2 text-white">
									<FileText className="h-5 w-5 text-cyan-300" />
									<span className="font-medium">{selectedFile.name}</span>
								</div>
								<p className="text-sm text-slate-300">
									Size: {formatFileSize(selectedFile.size)} | Type: {fileTypeLabel}
								</p>
							</div>

							<button
								type="button"
								onClick={clearUploadedFile}
								className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 transition hover:border-rose-300/50 hover:text-rose-200"
							>
								<Trash2 className="h-4 w-4" />
								Remove
							</button>
						</div>

						<div className="mt-4">
							{isUploading ? (
								<div className="flex items-center gap-2 text-sm text-cyan-200">
									<Loader2 className="h-4 w-4 animate-spin" />
									<span>Parsing resume...</span>
								</div>
							) : uploadProgress === 100 ? (
								<div className="flex items-center gap-2 text-sm text-emerald-200">
									<CheckCircle2 className="h-4 w-4" />
									<span>Parsing complete</span>
								</div>
							) : null}
						</div>
					</motion.div>
				) : null}

				{parsedData && uploadProgress === 100 ? (
					<motion.div
						initial={{ opacity: 0, y: 12 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.35 }}
						className="mt-6 rounded-2xl border border-emerald-300/25 bg-emerald-500/10 p-5"
					>
						<div className="mb-4 flex items-center gap-2 text-emerald-200">
							<CheckCircle2 className="h-5 w-5" />
							<p className="font-semibold">Resume parsed successfully</p>
						</div>

						<div className="rounded-xl border border-white/15 bg-slate-950/55 p-4 text-slate-100">
							<p className="text-sm text-slate-300">Name</p>
							<p className="mb-3 text-base font-semibold text-white">{parsedData?.name || ""}</p>

							<p className="text-sm text-slate-300">Email</p>
							<p className="mb-3 text-base font-semibold text-white">{parsedData?.email || ""}</p>

							<p className="text-sm text-slate-300">Skills</p>
							<div className="mb-3 mt-1 flex flex-wrap gap-2">
								{skills.map((skill: string) => (
									<span
										key={skill}
										className="rounded-full border border-cyan-200/30 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-100"
									>
										{skill}
									</span>
								))}
							</div>

							<p className="text-sm text-slate-300">Projects</p>
							<div className="mt-1 space-y-2">
								{projects.map(
									(project: { title?: string; description?: string }, index: number) => (
										<div
											key={`${project?.title || "project"}-${index}`}
											className="rounded-lg border border-blue-200/20 bg-blue-400/10 p-2"
										>
											<p className="text-sm font-semibold text-blue-100">{project?.title || ""}</p>
											<p className="text-xs text-blue-200/90">{project?.description || ""}</p>
										</div>
									)
								)}
							</div>

							<p className="mt-3 text-sm text-slate-300">Education</p>
							<div className="mt-1 flex flex-wrap gap-2">
								{education.map((item: string, index: number) => (
									<span
										key={`edu-${index}`}
										className="rounded-full border border-emerald-200/30 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-100"
									>
										{item}
									</span>
								))}
							</div>

							<p className="mt-3 text-sm text-slate-300">Experience</p>
							<div className="mt-1 flex flex-wrap gap-2">
								{experience.map((item: string, index: number) => (
									<span
										key={`exp-${index}`}
										className="rounded-full border border-violet-200/30 bg-violet-400/10 px-3 py-1 text-xs text-violet-100"
									>
										{item}
									</span>
								))}
							</div>
						</div>
					</motion.div>
				) : null}
			</motion.div>
		</motion.section>
	);
};

export default UploadZone;
