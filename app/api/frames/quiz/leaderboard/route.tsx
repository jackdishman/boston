import { NextRequest, NextResponse } from "next/server";
import { validateMessage } from "@/middleware/farcaster";

async function sendResults(fid: string, quizId: string): Promise<NextResponse> {
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

        <meta property="fc:frame:button:1" content="Give feedback" />
        <meta property="fc:frame:button:1:action" content="link" />
        <meta property="fc:frame:button:1:target" content="https://warpcast.com/dish" />

        <meta property="fc:frame:button:2" content="Source Code" />
        <meta property="fc:frame:button:2:action" content="link" />
        <meta property="fc:frame:button:2:target" content="https://github.com/jackdishman/farcaster-frame" />

        <meta property="fc:frame:button:3" content="Create Quiz & Stats" />
        <meta property="fc:frame:button:3:action" content="link" />
        <meta property="fc:frame:button:3:target" content="${process.env.NEXT_PUBLIC_HOST}/quiz" />
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
