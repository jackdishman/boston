import { NextRequest, NextResponse } from "next/server";
import {
  createSubmission,
  getQuestion,
  getQuestions,
  updateSubmission,
} from "@/middleware/quiz";
import { ISubmission, IQuestion } from "@/types/quiz";
import { validateMessage } from "@/middleware/farcaster";
import { getElapsedTimeString } from "@/middleware/quiz";

function sendResponse(
  isCorrect: boolean,
  quizId: string,
  currentQuestion: IQuestion,
  elapsedTime: string,
  progress: string
): NextResponse {
  const nextQuestionLink = `${process.env["NEXT_PUBLIC_HOST"]}/api/frames/quiz/question?quiz_id=${quizId}&question_id=${currentQuestion.next_question_id}`;
  const resultsLink = `${process.env["NEXT_PUBLIC_HOST"]}/api/frames/quiz/results?quiz_id=${quizId}`;
  const imageUrl = `${process.env["NEXT_PUBLIC_HOST"]}/api/frames/quiz/image/result?correct=${isCorrect}&explanation=${currentQuestion.explanation}&time=${elapsedTime}&progress=${progress}`;

  const response = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Vote Recorded</title>
        <meta property="og:title" content="Vote Recorded">
        <meta property="og:image" content="${imageUrl}">
        <meta property="fc:frame" content="vNext">
        <meta property="fc:frame:image" content="${imageUrl}">
        <meta property="fc:frame:post_url" content="${
          currentQuestion.next_question_id ? nextQuestionLink : resultsLink
        }">
        <meta property="fc:frame:button:1" content="Next question">
      </head>
      <body>
        <p></p>
      </body>
    </html>
  `;

  return new NextResponse(response, {
    status: 200,
    headers: { "Content-Type": "text/html" },
  });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const url = new URL(req.url);
    const quizId = url.searchParams.get("quiz_id");
    const questionId = url.searchParams.get("question_id");

    if (!quizId || !questionId) {
      return new NextResponse("Missing quiz_id or question_id", {
        status: 400,
      });
    }

    const { fid, buttonId, inputText } = await validateMessage(req);

    let submission: ISubmission | undefined = await createSubmission(
      Number(quizId),
      fid.toString()
    );

    if (!submission) {
      return new NextResponse("Error creating submission", { status: 500 });
    }

    const elapsedTimeString = getElapsedTimeString(
      submission.created_at,
      submission.time_completed
    );

    const currentQuestion = await getQuestion(
      Number(quizId),
      Number(questionId)
    );
    if (!currentQuestion) {
      return new NextResponse("Question not found", { status: 404 });
    }

    const questions = await getQuestions(Number(quizId));
    if (!questions) {
      return new NextResponse("Error fetching questions", { status: 500 });
    }

    const progress = `${submission.answers?.length + 1}/${questions.length}`;

    if (submission.answers) {
      const previousAnswer = submission.answers.find(
        (a) => a.question_id === Number(questionId)
      );
      if (previousAnswer) {
        return sendResponse(
          previousAnswer.is_correct,
          quizId,
          currentQuestion,
          elapsedTimeString,
          progress
        );
      }
    }

    let isCorrect = false;

    if (currentQuestion.answer === `option_${buttonId}`) {
      isCorrect = true;
    }

    if (
      currentQuestion.question_type === "short_answer" &&
      currentQuestion.answer &&
      currentQuestion.answer.toUpperCase().trim() ===
        inputText.toUpperCase().trim()
    ) {
      isCorrect = true;
    }

    try {
      submission = await updateSubmission(
        fid.toString(),
        submission,
        questionId,
        inputText,
        isCorrect
      );
    } catch (error) {
      console.error("Error updating submission", error);
      return new NextResponse("Error updating submission", { status: 500 });
    }

    return sendResponse(
      isCorrect,
      quizId,
      currentQuestion,
      elapsedTimeString,
      progress
    );
  } catch (error) {
    console.error(error);
    return new NextResponse("Error processing request", { status: 500 });
  }
}

export async function GET(): Promise<NextResponse> {
  return new NextResponse("Method not allowed", { status: 405 });
}
