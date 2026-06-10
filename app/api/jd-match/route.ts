import { NextRequest, NextResponse } from "next/server";
import analyzeJDMatch from "../../../lib/jd/jdMatcher";

interface JDMatchRequest {
	jobDescription?: string;
	resumeData?: Record<string, any>;
}

export async function POST(request: NextRequest) {
	try {
		// Parse request body
		let body: JDMatchRequest;
		try {
			body = await request.json();
		} catch {
			return NextResponse.json(
				{
					success: false,
					error: "Invalid JSON in request body",
				},
				{ status: 400 }
			);
		}

		// Validate jobDescription
		if (!body.jobDescription) {
			return NextResponse.json(
				{
					success: false,
					error: "Missing required field: jobDescription",
				},
				{ status: 400 }
			);
		}

		if (typeof body.jobDescription !== "string") {
			return NextResponse.json(
				{
					success: false,
					error: "jobDescription must be a string",
				},
				{ status: 400 }
			);
		}

		if (body.jobDescription.trim().length === 0) {
			return NextResponse.json(
				{
					success: false,
					error: "jobDescription cannot be empty",
				},
				{ status: 400 }
			);
		}

		// Validate resumeData
		if (!body.resumeData) {
			return NextResponse.json(
				{
					success: false,
					error: "Missing required field: resumeData",
				},
				{ status: 400 }
			);
		}

		if (typeof body.resumeData !== "object" || Array.isArray(body.resumeData)) {
			return NextResponse.json(
				{
					success: false,
					error: "resumeData must be an object",
				},
				{ status: 400 }
			);
		}

		if (Object.keys(body.resumeData).length === 0) {
			return NextResponse.json(
				{
					success: false,
					error: "resumeData cannot be empty",
				},
				{ status: 400 }
			);
		}

		// Analyze job description match
		const result = analyzeJDMatch(
			body.jobDescription,
			body.resumeData
		);

		if (!result.success) {
			return NextResponse.json(
				{
					success: false,
					error: result.error || "Analysis failed",
				},
				{ status: 500 }
			);
		}

		// Return successful result
		return NextResponse.json(
			{
				success: true,
				data: result,
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error("Error in /api/jd-match:", error);
		return NextResponse.json(
			{
				success: false,
				error:
					error instanceof Error
						? error.message
						: "Internal server error",
			},
			{ status: 500 }
		);
	}
}
