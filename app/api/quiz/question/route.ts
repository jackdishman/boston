import { NextRequest, NextResponse } from "next/server";
import { checkPrivyAuth } from "@/middleware/auth";
import { createSubmission, updateSubmission } from "@/middleware/quiz";

export async function POST(req: Request) {
  // get Authorization token from header
  const authToken =
    req.headers.get("Authorization")?.replace("Bearer ", "") ?? "";
  const verified = await checkPrivyAuth(authToken);
  if (!verified) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const { fid, submissionState, questionId, answer, isCorrect } = body;

  if (!submissionState) {
    return NextResponse.json(
      { error: "submissionState is required" },
      { status: 400 }
    );
  }

  try {
    const submission = await updateSubmission(
      fid,
      submissionState,
      questionId,
      answer,
      isCorrect
    );
    return NextResponse.json(submission, { status: 200 });
  } catch (error) {
    console.error("Error updating submission:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
