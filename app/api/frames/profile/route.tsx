import { NextRequest, NextResponse } from "next/server";
import { validateMessage } from "@/middleware/farcaster";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // validate message
    const { fid } = await validateMessage(req);

    // get open launches with creator fid

    // get open
    const imageUrl = `${process.env["NEXT_PUBLIC_HOST"]}/boston.png`;

    const responseHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Enter Reference</title>
        <meta property="og:title" content="Enter Reference">
        <meta property="og:image" content="${imageUrl}">
        <meta name="fc:frame" content="vNext">
        <meta property="fc:frame:image" content="${imageUrl}">
        <meta property="fc:frame:post_url" content="${process.env["NEXT_PUBLIC_HOST"]}/api/actions/mini-app}">
        <meta property="fc:frame:input:text" content="">
        <meta property="fc:frame:button:1" content="View Profile">
        </head>
      <body>
      </body>
    </html>
  `;

    return new NextResponse(responseHtml, {
      status: 200,
      headers: { "Content-Type": "text/html" },
    });
  } catch (error) {
    console.error(error);
    return new NextResponse("Error generating image", { status: 500 });
  }
}

export async function GET(): Promise<NextResponse> {
  return new NextResponse("Method not allowed", { status: 405 });
}
