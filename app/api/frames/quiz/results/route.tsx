import { NextRequest, NextResponse } from "next/server";
import {
  createSubmission,
  getQuestions,
  updateSubmissionScore,
} from "@/middleware/quiz";
import { validateMessage } from "@/middleware/farcaster";
import { getElapsedTimeString } from "@/middleware/quiz";
import { getPoints, rewardPoints } from "@/middleware/points";

async function sendFinalResults(
  percentage: number,
  quizId: string,
  elapsedTime: string,
  totalPoints?: number
): Promise<NextResponse> {
  const imageUrl = `${process.env["NEXT_PUBLIC_HOST"]}/api/frames/quiz/image/final?score=${percentage}&time=${elapsedTime}&progress=${quizId}&totalPoints=${totalPoints}`;

  const responseHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Final Results</title>
        <meta property="og:title" content="Final Results">
        <meta property="og:image" content="${imageUrl}">
        <meta name="fc:frame" content="vNext">
        <meta name="fc:frame:image" content="${imageUrl}">
        <meta name="fc:frame:post_url" content="${process.env["NEXT_PUBLIC_HOST"]}/api/frames/quiz/leaderboard?quiz_id=${quizId}">
        <meta name="fc:frame:button:1" content="View Leaderboard">
      </head>
      <body>
        <p>You scored ${percentage}%</p>
        <p>Elapsed time: ${elapsedTime}</p>
      </body>
    </html>
  `;

  return new NextResponse(responseHtml, {
    status: 200,
    headers: { "Content-Type": "text/html" },
  });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const url = new URL(req.url);
    const quizId = url.searchParams.get("quiz_id");

    if (!quizId) {
      return new NextResponse("Missing quiz_id", { status: 400 });
    }

    const { fid, address } = await validateMessage(req);

    let submission = await createSubmission(Number(quizId), fid.toString());

    if (submission && submission.score !== null) {
      const elapsedTime = getElapsedTimeString(
        submission.created_at,
        submission.time_completed
      );
      let totalPoints = 0;
      if (address) {
        totalPoints = await getPoints(address);
      }
      return sendFinalResults(
        submission.score,
        quizId,
        elapsedTime,
        totalPoints
      );
    }

    const questions = await getQuestions(Number(quizId));
    if (!questions || questions.length === 0) {
      return new NextResponse("No questions found", { status: 404 });
    }

    if (!submission || !submission.answers || submission.answers.length === 0) {
      throw new Error("Submission not found");
    }
    const percentage = Math.round(
      (submission.answers.filter((answer) => answer.is_correct).length /
        submission.answers.length) *
        100
    );

    try {
      submission = await updateSubmissionScore(submission.id, percentage);
      if (!submission) {
        return new NextResponse("Error updating submission score", {
          status: 500,
        });
      }
    } catch (error) {
      console.error("Error updating submission score", error);
      return new NextResponse("Error updating submission score", {
        status: 500,
      });
    }

    // give points
    if (
      address &&
      percentage >= 75 &&
      process.env["NEXT_PUBLIC_REWARD_POINTS"] === "true"
    ) {
      try {
        await rewardPoints(`quiz-${quizId}-complete`, address, 100);
      } catch (error) {
        console.error("Error rewarding points", error);
      }
    }
    const totalPoints = address ? await getPoints(address) : 0;

    const elapsedTime = getElapsedTimeString(
      submission.created_at,
      submission.time_completed
    );
    return sendFinalResults(percentage, quizId, elapsedTime, totalPoints);
  } catch (error) {
    console.error(error);
    return new NextResponse("Error generating image", { status: 500 });
  }
}

export async function GET(): Promise<NextResponse> {
  return new NextResponse("Method not allowed", { status: 405 });
}
