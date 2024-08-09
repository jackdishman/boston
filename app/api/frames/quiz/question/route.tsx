import { NextRequest, NextResponse } from "next/server";
import {
  createSubmission,
  getQuestion,
  getQuestions,
  getElapsedTimeString,
} from "@/middleware/quiz";
import { validateMessage } from "@/middleware/farcaster";
import { IAnswerEntry, IQuestion, ISubmission } from "@/types/quiz";

async function sendResults(
  percentage: number,
  quizId: string,
  elapsedTime: string,
  progress: string
): Promise<NextResponse> {
  const imageUrl = `${
    process.env["NEXT_PUBLIC_HOST"]
  }/api/frames/quiz/image/question?text=${
    "You scored " + percentage + " percent correct"
  }&time=${elapsedTime}&progress=${progress}`;

  const response = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Vote Recorded</title>
        <meta property="og:title" content="Vote Recorded">
        <meta property="og:image" content="${imageUrl}">
        <meta property="fc:frame" content="vNext">
        <meta property="fc:frame:image" content="${imageUrl}">
        <meta property="fc:frame:post_url" content="${process.env["NEXT_PUBLIC_HOST"]}/api/frames/quiz/results?quiz_id=${quizId}">
        <meta property="fc:frame:button:1" content="Done">
      </head>
      <body>
        <p>You scored ${percentage}%</p>
      </body>
    </html>
  `;

  return new NextResponse(response, {
    status: 200,
    headers: { "Content-Type": "text/html" },
  });
}

async function skipQuestionResponse(
  previousAnswer: IAnswerEntry,
  question: IQuestion,
  quizId: string,
  progress: string,
  elapsedTime: string
): Promise<NextResponse> {
  const text = `Question: ${question.text}, you answered ${
    previousAnswer.is_correct ? "correctly" : "incorrectly"
  }`;
  const imageUrl = `${process.env["NEXT_PUBLIC_HOST"]}/api/frames/quiz/image/question?text=${text}&time=${elapsedTime}&progress=${progress}`;
  const nextQuestionLink = `${process.env["NEXT_PUBLIC_HOST"]}/api/frames/quiz/question?quiz_id=${quizId}&question_id=${question.next_question_id}`;

  const response = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Vote Recorded</title>
        <meta property="og:title" content="Vote Recorded">
        <meta property="og:image" content="${imageUrl}">
        <meta property="fc:frame" content="vNext">
        <meta property="fc:frame:image" content="${imageUrl}">
        <meta property="fc:frame:post_url" content="${nextQuestionLink}">
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

    const { fid } = await validateMessage(req);

    let submission: ISubmission | undefined = await createSubmission(
      Number(quizId),
      fid.toString()
    );

    if (!submission) {
      return new NextResponse("Submission not found", { status: 404 });
    }

    const elapsedTime = getElapsedTimeString(
      submission.created_at,
      submission.time_completed
    );

    const questions = await getQuestions(Number(quizId));
    if (!questions || questions.length === 0) {
      return new NextResponse("No questions found", { status: 404 });
    }

    const progress = `${
      (submission.answers ? submission.answers.length : 0) + 1
    }/${questions.length}`;

    if (submission.score !== null) {
      return sendResults(submission.score, quizId, elapsedTime, progress);
    }

    const question = await getQuestion(Number(quizId), Number(questionId));

    if (!question) {
      if (submission.score !== null) {
        return sendResults(submission.score, quizId, elapsedTime, progress);
      }
      return new NextResponse("Error fetching questions", { status: 500 });
    }

    const previousAnswer = submission.answers?.find(
      (a) => a.question_id === parseInt(questionId, 10)
    );

    if (previousAnswer) {
      if (!question.next_question_id) {
        if (submission.score !== null) {
          return sendResults(submission.score, quizId, elapsedTime, progress);
        }
        return new NextResponse("Error fetching questions", { status: 500 });
      }
      return skipQuestionResponse(
        previousAnswer,
        question,
        quizId,
        progress,
        elapsedTime
      );
    }

    const imageUrl = `${process.env["NEXT_PUBLIC_HOST"]}/api/frames/quiz/image/question?text=${question.text}&time=${elapsedTime}&progress=${progress}`;
    let response = "";

    if (question.question_type === "multiple_choice") {
      response = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Question</title>
            <meta property="og:title" content="Question">
            <meta property="og:image" content="${imageUrl}">
            <meta property="fc:frame" content="vNext">
            <meta property="fc:frame:image" content="${imageUrl}">
            <meta property="fc:frame:post_url" content="${
              process.env["NEXT_PUBLIC_HOST"]
            }/api/frames/quiz/answer?quiz_id=${quizId}&question_id=${
        question.id
      }">
            ${question.options
              ?.map(
                (option, index) =>
                  `<meta property="fc:frame:button:${
                    index + 1
                  }" content="${option}">`
              )
              .join("")}
          </head>
          <body>
            <p>${question.text}</p>
          </body>
        </html>
      `;
    } else if (question.question_type === "short_answer") {
      response = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Question</title>
            <meta property="og:title" content="Question">
            <meta property="og:image" content="${imageUrl}">
            <meta property="fc:frame" content="vNext">
            <meta property="fc:frame:image" content="${imageUrl}">
            <meta property="fc:frame:post_url" content="${process.env["NEXT_PUBLIC_HOST"]}/api/frames/quiz/answer?quiz_id=${quizId}&question_id=${question.id}">
            <meta property="fc:frame:input:text" content="Submit your answer">
            <meta property="fc:frame:button:1" content="Submit">
          </head>
          <body>
            <p>${question.text}</p>
            <input type="text" placeholder="Enter your answer here"/>
          </body>
        </html>
      `;
    }

    return new NextResponse(response, {
      status: 200,
      headers: { "Content-Type": "text/html" },
    });
  } catch (error) {
    console.error(error);
    return new NextResponse("Error processing request", { status: 500 });
  }
}

export async function GET(): Promise<NextResponse> {
  return new NextResponse("Method not allowed", { status: 405 });
}
