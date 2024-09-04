import { NextRequest, NextResponse } from "next/server";
import { validateMessage } from "@/middleware/farcaster";
import { getQuizzes } from "@/middleware/quiz";

async function sendResults(fid: string, quizId: string): Promise<NextResponse> {
  // get random quiz
  const quizzes = await getQuizzes();
  if (!quizzes) {
    return new NextResponse("No quizzes found", { status: 404 });
  }
  const quiz = quizzes[Math.floor(Math.random() * quizzes.length)];
  const id = quiz.id;

  const imageUrl = `${process.env["NEXT_PUBLIC_HOST"]}/api/frames/quiz/image/leaderboard?fid=${fid}&quiz_id=${quizId}`;

  const responseHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Vote Recorded</title>
        <meta property="og:title" content="Vote Recorded">
        <meta property="og:image" content="${imageUrl}">
        <meta name="fc:frame" content="vNext">
        <meta name="fc:frame:image" content="${imageUrl}">

        <meta property="fc:frame:button:1" content="Full Result Breakdown" />
        <meta property="fc:frame:button:1:action" content="link" />
        <meta property="fc:frame:button:1:target" content="${process.env.NEXT_PUBLIC_HOST}/quiz/${quizId}" />

        <meta property="fc:frame:button:2" content="Choose a Quiz" />
        <meta property="fc:frame:button:2:action" content="link" />
        <meta property="fc:frame:button:2:target" content="${process.env.NEXT_PUBLIC_HOST}/quiz" />
        
        <meta property="fc:frame:button:3" content="Random Quiz" />
        </head>
      <body>
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

    // validate message
    const { fid } = await validateMessage(req);

    return await sendResults(fid.toString(), quizId);
  } catch (error) {
    console.error(error);
    return new NextResponse("Error generating image", { status: 500 });
  }
}

export async function GET(): Promise<NextResponse> {
  return new NextResponse("Method not allowed", { status: 405 });
}
