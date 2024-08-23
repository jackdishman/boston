import { NextRequest, NextResponse } from "next/server";
import { checkPrivyAuth } from "@/middleware/auth";
import { updateSubmissionScore } from "@/middleware/quiz";
import { rewardPoints } from "@/middleware/points";

export async function POST(req: Request) {
  // get Authorization token from header
  const authToken =
    req.headers.get("Authorization")?.replace("Bearer ", "") ?? "";
  const verified = await checkPrivyAuth(authToken);
  if (!verified) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const { submissionId, score, quizId, address } = body;

  if (!submissionId || score === undefined) {
    return NextResponse.json(
      { error: "submissionId and score are required" },
      { status: 400 }
    );
  }

  try {
    const submission = await updateSubmissionScore(submissionId, score);

    if (score >= 75) {
      await rewardPoints(`quiz-${quizId}-complete`, address, 100);
    }
    return NextResponse.json(submission, { status: 200 });
  } catch (error) {
    console.error("Error updating submission:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
