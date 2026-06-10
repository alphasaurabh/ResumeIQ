import { NextResponse } from "next/server";
import { parseResumeFile } from "../../../services/resumeService";

export const runtime = "nodejs";

const SUPPORTED_MIME_TYPES = new Set([
	"application/pdf",
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const hasValidExtension = (fileName: string) => {
	const lower = fileName.toLowerCase();
	return lower.endsWith(".pdf") || lower.endsWith(".docx");
};

const isSupportedFile = (file: File) => {
	if (SUPPORTED_MIME_TYPES.has(file.type)) {
		return true;
	}

	return hasValidExtension(file.name || "");
};

export async function POST(request: Request) {
	try {
		const contentType = request.headers.get("content-type") || "";
		let fileEntry: File | { name?: string; type?: string; buffer?: ArrayBuffer } | null =
			null;

		if (contentType.startsWith("multipart/form-data")) {
			const formData = await request.formData();
			const uploadedFile = formData.get("file");

			if (uploadedFile instanceof File) {
				fileEntry = uploadedFile;
			}
		} else {
			const buffer = await request.arrayBuffer();
			fileEntry = {
				buffer,
				name: request.headers.get("x-file-name") || "resume",
				type: request.headers.get("x-file-type") || contentType,
			};
		}

		if (!fileEntry) {
			return NextResponse.json(
				{
					success: false,
					error: "Missing file upload data.",
				},
				{ status: 400 }
			);
		}

		if (!isSupportedFile(fileEntry as File)) {
			return NextResponse.json(
				{
					success: false,
					error: "Invalid file type. Only PDF and DOCX files are supported.",
				},
				{ status: 415 }
			);
		}

		const parsedResume = await parseResumeFile(fileEntry);

		return NextResponse.json(
			{
				success: true,
				data: parsedResume,
			},
			{ status: 200 }
		);
	} catch (error) {
		return NextResponse.json(
			{
				success: false,
				error:
					error instanceof Error
						? `Failed to parse resume: ${error.message}`
						: "Failed to parse resume.",
			},
			{ status: 422 }
		);
	}
}
