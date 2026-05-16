import { NextResponse } from "next/server";
import parseResumeFile from "../../../services/resumeService";

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
		const formData = await request.formData();
		const fileEntry = formData.get("file");

		if (!fileEntry) {
			return NextResponse.json(
				{
					success: false,
					error: "Missing file. Provide a resume file in the 'file' field.",
				},
				{ status: 400 }
			);
		}

		if (!(fileEntry instanceof File)) {
			return NextResponse.json(
				{
					success: false,
					error: "Invalid file input. Expected a multipart file upload.",
				},
				{ status: 400 }
			);
		}

		if (!isSupportedFile(fileEntry)) {
			return NextResponse.json(
				{
					success: false,
					error: "Invalid file type. Only PDF and DOCX files are supported.",
				},
				{ status: 415 }
			);
		}

		const resumeService = {
			parseResume: parseResumeFile,
		};

		const parsedResume = await resumeService.parseResume(fileEntry);

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
