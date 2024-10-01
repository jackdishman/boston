import { NextRequest, NextResponse } from "next/server";
import { validateMessage } from "@/middleware/farcaster";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // validate message
    const { fid, address } = await validateMessage(req);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id") || "";

    // get open
    const imageUrl = `${process.env["NEXT_PUBLIC_HOST"]}/api/frames/crowdfund/image?id=${id}`;

    const responseHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Enter amount to contribute</title>
        <meta property="og:title" content="Contribute">
        <meta property="og:image" content="${imageUrl}">
        <meta name="fc:frame" content="vNext">
        <meta property="fc:frame:image" content="${imageUrl}">
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
