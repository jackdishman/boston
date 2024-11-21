import { validateMessage } from "@/middleware/farcaster";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { fid, address } = await validateMessage(req);

  const imageUrl = `${process.env["NEXT_PUBLIC_HOST"]}/api/frames/charlie/image?fid=${fid}`;

  const response = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Charlie</title>
            <meta property="og:title" content="Charlie">
            <meta property="og:image" content="${imageUrl}">
            <meta property="fc:frame" content="vNext">
            <meta property="fc:frame:image" content="${imageUrl}">
            <meta property="fc:frame:post_url" content="${process.env.NEXT_PUBLIC_HOST}/api/frames/charlie/generate">
            <meta property="fc:frame:button:1" content="Mint">
        </head>
        <body>
            <p>Charlie</p>
        </body>
        </html>
    `;

  return new NextResponse(response, {
    status: 200,
    headers: {
      "Content-Type": "text/html",
      "Cache-Control": "max-age=10", // Set max-age to 10 seconds
    },
  });
}
