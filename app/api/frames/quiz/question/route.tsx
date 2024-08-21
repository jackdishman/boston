import { NextRequest, NextResponse } from "next/server";
import {
  createSubmission,
  getQuestion,
  getQuestions,
  getElapsedTimeString,
} from "@/middleware/quiz";
import { validateMessage } from "@/middleware/farcaster";
import { IAnswerEntry, IQuestion, ISubmission } from "@/types/quiz";
import { getPoints } from "@/middleware/points";

async function sendResults(
  percentage: number,
  quizId: string,
  elapsedTime: string,
  progress: string,
  totalPoints?: number
): Promise<NextResponse> {
  console.log("Total points:", totalPoints);
  const imageUrl = `${process.env["NEXT_PUBLIC_HOST"]}/api/frames/quiz/image/final?score=${percentage}&time=${elapsedTime}&progress=${progress}&totalPoints=${totalPoints}`;
  const resultsLink = `${process.env["NEXT_PUBLIC_HOST"]}/api/frames/quiz/leaderboard?quiz_id=${quizId}`;

  const response = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Results</title>
        <meta property="og:title" content="Results">
        <meta property="og:image" content="${imageUrl}">
        <meta property="fc:frame" content="vNext">
        <meta property="fc:frame:image" content="${imageUrl}">
        <meta property="fc:frame:post_url" content="${resultsLink}">
        <meta property="fc:frame:button:1" content="Leaderboard">
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
  const text = question.text;
  const imageUrl = `${process.env["NEXT_PUBLIC_HOST"]}/api/frames/quiz/image/skip-question?text=${text}&time=${elapsedTime}&isCorrect=${previousAnswer.is_correct}&previousAnswer=${previousAnswer.answer}&progress=${progress}&correctAnswer=${question.answer}`;
  const nextQuestionLink = `${process.env["NEXT_PUBLIC_HOST"]}/api/frames/quiz/question?quiz_id=${quizId}&question_id=${question.next_question_id}`;

  const response = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Next Question</title>
        <meta property="og:title" content="Next Question">
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

    const { fid, address } = await validateMessage(req);

    const submission: ISubmission | undefined = await createSubmission(
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

    let totalPoints = 0;
    if (address) {
      totalPoints = await getPoints(address);
    }

    if (submission.score !== null) {
      const questions = await getQuestions(Number(quizId));
      const progress = `${questions?.length} of ${questions?.length}`;
      return sendResults(
        submission.score,
        quizId,
        elapsedTime,
        progress,
        totalPoints
      );
    }

    const questions = await getQuestions(Number(quizId));
    if (!questions || questions.length === 0) {
      return new NextResponse("No questions found", { status: 404 });
    }

    const progress = `${
      (submission.answers ? submission.answers.length : 0) + 1
    } of ${questions.length}`;

    const question = await getQuestion(Number(quizId), Number(questionId));
    if (!question) {
      return new NextResponse("Error fetching question", { status: 500 });
    }

    const previousAnswer = submission.answers?.find(
      (a) => a.question_id === parseInt(questionId, 10)
    );

    if (previousAnswer) {
      if (!question.next_question_id) {
        return sendResults(
          submission.score ?? 0,
          quizId,
          elapsedTime,
          progress,
          totalPoints
        );
      }

      return skipQuestionResponse(
        previousAnswer,
        question,
        quizId,
        progress,
        elapsedTime
      );
    }

    let imageUrl = `${process.env["NEXT_PUBLIC_HOST"]}/api/frames/quiz/image/question?time=${elapsedTime}&progress=${progress}&questionId=${question.id}`;

    if (question.question_type === "multiple_choice" && question.options) {
      imageUrl += `&optionA=${encodeURIComponent(
        question.options[0]
      )}&optionB=${encodeURIComponent(
        question.options[1]
      )}&optionC=${encodeURIComponent(
        question.options[2]
      )}&optionD=${encodeURIComponent(question.options[3])}`;
    }
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
      <meta property="fc:frame:post_url" content="${process.env["NEXT_PUBLIC_HOST"]}/api/frames/quiz/answer?quiz_id=${quizId}&question_id=${question.id}">
      <meta property="fc:frame:button:1" content="A">
      <meta property="fc:frame:button:2" content="B">
      <meta property="fc:frame:button:3" content="C">
      <meta property="fc:frame:button:4" content="D">
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
    console.error("Error processing request:", error);
    return new NextResponse("Error processing request", { status: 500 });
  }
}

export async function GET(): Promise<NextResponse> {
  return new NextResponse("Method not allowed", { status: 405 });
}
