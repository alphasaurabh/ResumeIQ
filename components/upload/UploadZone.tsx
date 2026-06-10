"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";
import {
    Award,
    BrainCircuit,
    BriefcaseBusiness,
    Braces,
    CheckCircle2,
    Code2,
    Database,
    FileText,
    FolderKanban,
    Globe,
    GraduationCap,
    Loader2,
    Mail,
    MapPin,
    Link2,
    Trash2,
    UploadCloud,
    UserRound,
    Wrench,
} from "lucide-react";
import useResumeStore from "../../store/resumeStore";
import { ATSDashboard, ParseConfidence, ResumeOptimizer } from "../analysis";
import JDMatcher, { type MatchResult } from "../analysis/JDMatcher";

const acceptedFileTypes = {
    "application/pdf": [".pdf"],
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
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

const normalizeExternalLink = (value: unknown) => {
    if (typeof value !== "string") {
        return "";
    }

    const trimmed = value.trim();
    if (!trimmed) {
        return "";
    }

    const prefixed = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

    try {
        return new URL(prefixed).href;
    } catch {
        return "";
    }
};

const pickMatchingLink = (links: string[], patterns: RegExp[]) => {
    for (const link of links) {
        if (patterns.some((pattern) => pattern.test(link))) {
            return link;
        }
    }

    return "";
};

const isLinkedInLink = (link: string) => link.toLowerCase().includes("linkedin.com");

const isGitHubLink = (link: string) => link.toLowerCase().includes("github.com");

const normalizeNameSignals = (name: string) => {
    const tokens = name
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter((token) => token.length >= 4 && token !== "candidate" && token !== "profile");

    return {
        compactName: tokens.join(""),
        tokens,
    };
};

const getLinkParts = (link: string) => {
    try {
        const parsed = new URL(link);
        const hostname = parsed.hostname.toLowerCase().replace(/^www\./, "");
        const labels = hostname.split(".").filter(Boolean);

        return {
            hostname,
            labels,
        };
    } catch {
        return {
            hostname: "",
            labels: [],
        };
    }
};

const scorePortfolioLink = (link: string, profileName: string) => {
    const { hostname, labels } = getLinkParts(link);
    if (!hostname) {
        return Number.NEGATIVE_INFINITY;
    }

    const { compactName, tokens } = normalizeNameSignals(profileName);
    const searchableDomain = hostname.replace(/[^a-z0-9]/g, "");
    const firstLabel = labels[0] || "";
    const hasSubdomain = labels.length > 2;

    let score = 0;

    if (/portfolio|personal|resume|cv/.test(searchableDomain)) {
        score += 100;
    }

    if (compactName && searchableDomain.includes(compactName)) {
        score += 80;
    } else if (tokens.some((token) => searchableDomain.includes(token))) {
        score += 55;
    }

    if (!hasSubdomain) {
        score += 60;
    } else {
        score -= 35;
    }

    if (/demo|preview|staging|product|project|app|client|admin|dashboard/.test(firstLabel)) {
        score -= 30;
    }

    if (/(vercel\.app|netlify\.app|herokuapp\.com|firebaseapp\.com|web\.app|pages\.dev|onrender\.com|railway\.app)$/.test(hostname)) {
        score -= 45;
    }

    return score;
};

const pickPortfolioLink = (links: string[], profileName: string) =>
    links
        .filter((link) => !isLinkedInLink(link) && !isGitHubLink(link))
        .map((link, index) => ({
            link,
            index,
            score: scorePortfolioLink(link, profileName),
        }))
        .sort((a, b) => b.score - a.score || a.index - b.index)[0]?.link || "";

const summarizeText = (text: string, maxLength = 220) => {
    if (!text) {
        return "";
    }

    const normalized = text.replace(/\s+/g, " ").trim();
    if (normalized.length <= maxLength) {
        return normalized;
    }

    return `${normalized.slice(0, maxLength).trimEnd()}…`;
};

const extractProjectMetrics = (text: string) => {
    if (!text) {
        return [] as string[];
    }

    const matches = text.match(/\b\d+(?:\.\d+)?%|\b\d+x\b|\b\d+\+\b|\b\d{2,4}\s*(?:users|clients|requests|downloads|subscribers|members|hours|days|weeks|months)\b/gi);
    return matches ? Array.from(new Set(matches)).slice(0, 3) : [];
};

const categorizeSkills = (skills: string[]) => {
    const categories = [
        { title: "Frontend", icon: Code2, matchers: [/react/i, /next\.js/i, /vue/i, /angular/i, /html/i, /css/i, /tailwind/i, /redux/i, /zustand/i, /frontend/i, /javascript/i, /typescript/i] },
        { title: "Backend", icon: BriefcaseBusiness, matchers: [/node\.js/i, /express/i, /nestjs/i, /api/i, /backend/i, /rest/i, /graphql/i, /python/i, /java/i, /go/i, /php/i, /ruby/i] },
        { title: "Database", icon: Database, matchers: [/mongodb/i, /postgresql/i, /mysql/i, /sqlite/i, /redis/i, /prisma/i, /sql/i, /nosql/i, /database/i] },
        { title: "Programming", icon: Braces, matchers: [/javascript/i, /typescript/i, /python/i, /java/i, /c\+\+/i, /c#/i, /go/i, /ruby/i, /php/i, /oop/i, /algorithms?/i, /data structures?/i] },
        { title: "Tools", icon: Wrench, matchers: [/git/i, /github/i, /gitlab/i, /docker/i, /kubernetes/i, /aws/i, /azure/i, /gcp/i, /figma/i, /jest/i, /cypress/i, /playwright/i, /linux/i, /firebase/i] },
        { title: "AI/ML", icon: BrainCircuit, matchers: [/machine learning/i, /nlp/i, /tensorflow/i, /pytorch/i, /scikit-learn/i, /pandas/i, /numpy/i, /ai/i] },
    ];

    return categories
        .map((category) => ({
            ...category,
            skills: skills.filter((skill) => category.matchers.some((pattern) => pattern.test(skill))),
        }))
        .filter((category) => category.skills.length > 0);
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
    const [jdMatchData, setJdMatchData] = useState<MatchResult | null>(null);

    useEffect(() => {
        setJdMatchData(null);
    }, [parsedData]);

    const parseResume = useCallback(
        async (file: File) => {
            setIsUploading(true);
            setUploadProgress(0);
            setParsedData(null);
            setJdMatchData(null);
            setUploadError("");

            try {
                const response = await fetch("/api/upload", {
                    method: "POST",
                    headers: {
                        "Content-Type": file.type || "application/octet-stream",
                        "X-File-Name": file.name,
                        "X-File-Type": file.type || "",
                    },
                    body: await file.arrayBuffer(),
                });

                const responseText = await response.text();
                let responseJson: { success?: boolean; data?: unknown; error?: string } | null = null;

                if (responseText) {
                    try {
                        responseJson = JSON.parse(responseText);
                    } catch {
                        responseJson = null;
                    }
                }

                if (!response.ok || !responseJson?.success) {
                    throw new Error(responseJson?.error || responseText || "Failed to parse resume.");
                }

                setParsedData(responseJson?.data || null);
                setUploadProgress(100);
            } catch (error) {
                setUploadError(error instanceof Error ? error.message : "Failed to parse resume.");
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

    const fileTypeLabel = useMemo(() => {
        if (!selectedFile) {
            return "-";
        }

        const extension = selectedFile.name.split(".").pop()?.toUpperCase();
        return extension ? extension : selectedFile.type || "Unknown";
    }, [selectedFile]);

    const skills = Array.isArray(parsedData?.skills) ? parsedData.skills : [];
    const projects = Array.isArray(parsedData?.projects) ? parsedData.projects : [];
    const education = Array.isArray(parsedData?.education) ? parsedData.education : [];
    const experience = Array.isArray(parsedData?.experience) ? parsedData.experience : [];
    const certifications = Array.isArray(parsedData?.certifications) ? parsedData.certifications : [];
    const groupedSkills = useMemo(() => categorizeSkills(skills), [skills]);
    const normalizedLinks = useMemo(
        () =>
            Array.isArray(parsedData?.links)
                ? parsedData.links.map(normalizeExternalLink).filter(Boolean)
                : [],
        [parsedData]
    );
    const profileName = parsedData?.name || "Candidate Profile";
    const linkedinLink = pickMatchingLink(normalizedLinks, [/linkedin\.com/i]);
    const githubLink = pickMatchingLink(normalizedLinks, [/github\.com/i]);
    const portfolioLink = pickPortfolioLink(normalizedLinks, profileName);
    const profileInitials = profileName
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("");

    return (
        <motion.section initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="w-full">
            <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 260, damping: 20 }} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg sm:p-8">
                <div
                    {...getRootProps()}
                    className={`group relative cursor-pointer overflow-hidden rounded-2xl border border-dashed p-8 text-center transition-all duration-300 sm:p-12 ${isDragActive ? "border-indigo-600/90 bg-indigo-50" : "border-slate-200 bg-white hover:border-indigo-600/60 hover:bg-slate-50"
                        } ${isUploading ? "cursor-not-allowed opacity-90" : ""}`}
                >
                    <input {...getInputProps()} />
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.06),transparent_45%)] opacity-30" />
                    <div className="relative z-10 flex flex-col items-center gap-4">
                        <div className="rounded-full border border-slate-200 bg-white p-4 shadow">
                            <UploadCloud className="h-10 w-10 text-indigo-600" />
                        </div>
                        <div>
                            <p className="text-xl font-semibold text-slate-900 sm:text-2xl">{isDragActive ? "Drop your resume here" : "Upload your resume to begin"}</p>
                            <p className="mt-2 text-sm text-slate-500">Drag and drop a file, or click to browse. PDF and DOCX only.</p>
                        </div>
                    </div>
                </div>

                {uploadError ? <p className="mt-4 rounded-lg border border-rose-300/40 bg-rose-50 px-4 py-2 text-sm text-rose-700">{uploadError}</p> : null}

                {selectedFile ? (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-slate-900">
                                    <FileText className="h-5 w-5 text-indigo-600" />
                                    <span className="font-medium">{selectedFile.name}</span>
                                </div>
                                <p className="text-sm text-slate-500">Size: {formatFileSize(selectedFile.size)} | Type: {fileTypeLabel}</p>
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    clearUploadedFile();
                                    setJdMatchData(null);
                                }}
                                className="inline-flex items-center gap-2 rounded-3xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 transition hover:border-indigo-600"
                            >
                                <Trash2 className="h-4 w-4" />
                                Remove
                            </button>
                        </div>

                        <div className="mt-4">
                            {isUploading ? (
                                <div className="flex items-center gap-2 text-sm text-cyan-700">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span>Parsing resume...</span>
                                </div>
                            ) : uploadProgress === 100 ? (
                                <div className="flex items-center gap-2 text-sm text-emerald-600">
                                    <CheckCircle2 className="h-4 w-4" />
                                    <span>Parsing complete</span>
                                </div>
                            ) : null}
                        </div>
                    </motion.div>
                ) : null}

                {parsedData && uploadProgress === 100 ? (
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="mt-6 rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.06)] sm:p-6 lg:p-8">
                        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <p className="text-xs font-medium uppercase tracking-[0.28em] text-indigo-600">Parsed Resume</p>
                                <h2 className="mt-2 text-2xl font-semibold text-slate-900 sm:text-3xl">Candidate Profile Dashboard</h2>
                                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">A structured profile view that turns raw parser output into a polished resume dashboard.</p>
                            </div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 shadow-sm">
                                <CheckCircle2 className="h-4 w-4" />
                                Resume parsed successfully
                            </div>
                        </div>

                        <div className="space-y-8">
                            <section>
                                <div className="mb-4 flex items-center gap-2 text-slate-900">
                                    <UserRound className="h-4 w-4 text-indigo-600" />
                                    <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-700">Candidate Header</h3>
                                </div>
                                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                                        <div className="flex flex-col">
                                            <div>
                                                <p className="text-2xl font-semibold text-slate-900 sm:text-3xl">{profileName}</p>
                                                <p className="mt-1 text-sm text-slate-500">Structured contact details extracted from the resume.</p>
                                            </div>
                                        </div>
                                        <div className="grid w-full gap-3 sm:grid-cols-2 lg:max-w-2xl">
                                            <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm">
                                                <Mail className="mt-0.5 h-4 w-4 text-indigo-600" />
                                                <div>
                                                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Email</p>
                                                    {parsedData?.email ? <a href={`mailto:${parsedData.email}`} className="mt-1 block text-sm font-medium text-slate-900 transition hover:text-indigo-600">{parsedData.email}</a> : <p className="mt-1 text-sm font-medium text-slate-400">Not detected</p>}
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm">
                                                <Link2 className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />

                                                <div className="min-w-0 flex-1">
                                                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                                                        LinkedIn
                                                    </p>

                                                    {linkedinLink ? (
                                                        <a
                                                            href={linkedinLink}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="mt-1 block text-sm font-medium text-indigo-600 transition hover:text-indigo-700"
                                                        >
                                                            View Profile
                                                        </a>
                                                    ) : (
                                                        <p className="mt-1 text-sm font-medium text-slate-400">
                                                            Not detected
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm">
                                                <Globe className="mt-0.5 h-4 w-4 text-indigo-600" />
                                                <div>
                                                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Portfolio</p>
                                                    {portfolioLink ? <a href={portfolioLink} target="_blank" rel="noreferrer" className="mt-1 block truncate text-sm font-medium text-slate-900 transition hover:text-indigo-600">{portfolioLink}</a> : <p className="mt-1 text-sm font-medium text-slate-400">Not detected</p>}
                                                </div>
                                            </div>

                                           <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm">
    <Link2 className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />

    <div className="min-w-0 flex-1">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
            GitHub
        </p>

        {githubLink ? (
            <a
                href={githubLink}
                target="_blank"
                rel="noreferrer"
                className="mt-1 block text-sm font-medium text-indigo-600 transition hover:text-indigo-700"
            >
                View Repository
            </a>
        ) : (
            <p className="mt-1 text-sm font-medium text-slate-400">
                Not detected
            </p>
        )}
    </div>
</div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section>
                                <div className="mb-4 flex items-center gap-2 text-slate-900">
                                    <Code2 className="h-4 w-4 text-cyan-600" />
                                    <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-700">Skills</h3>
                                </div>
                                {groupedSkills.length > 0 ? (
                                    <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                                        {groupedSkills.map((category) => {
                                            const CategoryIcon = category.icon;
                                            return (
                                                <div key={category.title} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                                                    <div className="flex items-center gap-2 text-slate-900">
                                                        <CategoryIcon className="h-4 w-4 text-indigo-600" />
                                                        <p className="text-sm font-semibold">{category.title}</p>
                                                    </div>
                                                    <div className="mt-4 flex flex-wrap gap-2">
                                                        {category.skills.map((skill: string) => <span key={`${category.title}-${skill}`} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700 shadow-sm">{skill}</span>)}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : <div className="rounded-3xl border border-slate-200 bg-white p-5 text-sm text-slate-500 shadow-sm">No skills detected.</div>}
                            </section>

                            <section>
                                <div className="mb-4 flex items-center gap-2 text-slate-900">
                                    <FolderKanban className="h-4 w-4 text-indigo-600" />
                                    <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-700">Projects</h3>
                                </div>
                                {projects.length > 0 ? (
                                    <div className="grid gap-4 xl:grid-cols-2">
                                        {projects.map((project: { title?: string; description?: string; techStack?: string[] }, index: number) => {
                                            const description = summarizeText(project?.description || "", 240);
                                            const metrics = extractProjectMetrics(project?.description || "");

                                            return (
                                                <div key={`${project?.title || "project"}-${index}`} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                                        <div>
                                                            <p className="text-lg font-semibold text-slate-900">{project?.title || "Project"}</p>
                                                            <div className="mt-2 flex flex-wrap gap-2">
                                                                {project?.techStack && project.techStack.length > 0 ? project.techStack.slice(0, 6).map((tech: string) => <span key={`${project?.title || "project"}-${tech}`} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700 shadow-sm">{tech}</span>) : <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-500">Tech stack not detected</span>}
                                                            </div>
                                                        </div>
                                                        {metrics.length > 0 ? <div className="flex flex-wrap gap-2">{metrics.map((metric) => <span key={metric} className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">{metric}</span>)}</div> : null}
                                                    </div>

                                                    <p className="mt-4 text-sm leading-6 text-slate-600">{description}</p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : <div className="rounded-3xl border border-slate-200 bg-white p-5 text-sm text-slate-500 shadow-sm">No projects detected.</div>}
                            </section>

                            <section>
                                <div className="mb-4 flex items-center gap-2 text-slate-900">
                                    <GraduationCap className="h-4 w-4 text-cyan-600" />
                                    <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-700">Education</h3>
                                </div>
                                <div className="space-y-4">
                                    {education.length > 0 ? education.map((item: { institution?: string; degree?: string; duration?: string; score?: string }, index: number) => (
                                        <div key={`edu-${index}`} className="relative pl-6">
                                            <span className="absolute left-1.5 top-6 h-3 w-3 rounded-full border-4 border-white bg-indigo-500 shadow-sm" />
                                            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                                    <div>
                                                        <p className="text-base font-semibold text-slate-900">{item?.institution || "Institution not detected"}</p>
                                                        {item?.degree ? <p className="mt-1 text-sm text-slate-600">{item.degree}</p> : null}
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {item?.duration ? <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700">{item.duration}</span> : null}
                                                        {item?.score ? <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">{item.score}</span> : null}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )) : <div className="rounded-3xl border border-slate-200 bg-white p-5 text-sm text-slate-500 shadow-sm">No education entries detected.</div>}
                                </div>
                            </section>

                            <section>
                                <div className="mb-4 flex items-center gap-2 text-slate-900">
                                    <BriefcaseBusiness className="h-4 w-4 text-indigo-600" />
                                    <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-700">Experience</h3>
                                </div>
                                <div className="space-y-4">
                                    {experience.length > 0 ? experience.map((item: { role?: string; company?: string; location?: string; duration?: string; description?: string[] }, index: number) => (
                                        <div key={`exp-${index}`} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                                <div>
                                                    <p className="text-base font-semibold text-slate-900">{item?.role || "Role not detected"}</p>
                                                    <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-600">
                                                        {item?.company ? <span>{item.company}</span> : null}
                                                        {item?.company && item?.location ? <span>•</span> : null}
                                                        {item?.location ? <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-cyan-600" />{item.location}</span> : null}
                                                    </div>
                                                </div>
                                                {item?.duration ? <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700">{item.duration}</span> : null}
                                            </div>
                                            {Array.isArray(item?.description) && item.description.length > 0 ? (
                                                <ul className="mt-4 space-y-2">
                                                    {item.description.slice(0, 4).map((desc: string, dIdx: number) => (
                                                        <li key={dIdx} className="flex gap-3 text-sm leading-6 text-slate-600">
                                                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
                                                            <span>{desc}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : <p className="mt-4 text-sm text-slate-400">No bullet achievements detected.</p>}
                                        </div>
                                    )) : <div className="rounded-3xl border border-slate-200 bg-white p-5 text-sm text-slate-500 shadow-sm">No experience entries detected.</div>}
                                </div>
                            </section>

                            <section>
                                <div className="mb-4 flex items-center gap-2 text-slate-900">
                                    <Award className="h-4 w-4 text-emerald-600" />
                                    <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-700">Certifications</h3>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {certifications.length > 0 ? certifications.map((certification: string, index: number) => (
                                        <span key={`cert-${index}-${certification}`} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm">
                                            <Award className="h-4 w-4 text-emerald-600" />
                                            {certification}
                                        </span>
                                    )) : <p className="text-sm text-slate-400">No certifications detected.</p>}
                                </div>
                            </section>
                        </div>
                    </motion.div>
                ) : null}

                {parsedData?.parseConfidence && uploadProgress === 100 ? (
                    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.18 }} className="mt-8">
                        <ParseConfidence data={parsedData.parseConfidence} />
                    </motion.div>
                ) : null}

                {parsedData?.ats && uploadProgress === 100 ? (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="mt-8">
                        <ATSDashboard ats={parsedData.ats} />
                    </motion.div>
                ) : null}

                {parsedData ? (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.28 }} className="mt-8">
                        <JDMatcher resumeData={parsedData} onAnalysisComplete={setJdMatchData} />
                    </motion.div>
                ) : null}

                {parsedData && jdMatchData ? (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.36 }} className="mt-8">
                        <ResumeOptimizer parsedData={parsedData} ats={parsedData?.ats} jdMatchData={jdMatchData} />
                    </motion.div>
                ) : null}
            </motion.div>
        </motion.section>
    );
};

export default UploadZone;
