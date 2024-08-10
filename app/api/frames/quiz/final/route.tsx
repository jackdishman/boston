import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import satori from "satori";
import { join } from "path";
import * as fs from "fs";

const fontPath = join(process.cwd(), "Roboto-Regular.ttf");
let fontData = fs.readFileSync(fontPath);

async function sendFinalResults(
  percentage: number,
  quizId: string,
  elapsedTime: string
): Promise<NextResponse> {
  const imageUrl = `${process.env["NEXT_PUBLIC_HOST"]}/api/frames/quiz/image/final?score=${percentage}&time=${elapsedTime}&progress=${quizId}`;

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

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url);
    const score = searchParams.get("score") ?? "0%";
    const time = searchParams.get("time") ?? "";
    const progress = searchParams.get("progress") ?? "";

    const svg = await satori(
      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#222",
          padding: "20px",
          border: "10px solid #ffcc00",
          fontFamily: "Roboto",
          color: "#fff",
          boxShadow: "0 0 20px rgba(0, 0, 0, 0.5)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-30px",
            backgroundColor: "#ffcc00",
            padding: "5px 20px",
            color: "#000",
            fontSize: "16px",
            fontWeight: "bold",
            textTransform: "uppercase",
          }}
        >
          Final Results
        </div>
        <h2
          style={{
            fontSize: "36px",
            fontWeight: "bold",
            marginBottom: "20px",
            textShadow: "2px 2px #000",
          }}
        >
          You Scored {score}
        </h2>
        <h3
          style={{
            fontSize: "24px",
            fontWeight: "normal",
            color: "#ffcc00",
            textShadow: "1px 1px #000",
          }}
        >
          Time: {time}
        </h3>
        <h4
          style={{
            fontSize: "20px",
            color: "#fff",
          }}
        >
          Progress: {progress}
        </h4>
      </div>,
      {
        width: 1148, // 600 * 1.91
        height: 600, // 1.91:1 aspect ratio
        fonts: [
          {
            data: fontData,
            name: "Roboto",
            style: "normal",
            weight: 400,
          },
        ],
      }
    );

    const pngBuffer = await sharp(Buffer.from(svg)).toFormat("png").toBuffer();

    return new NextResponse(pngBuffer, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "max-age=10",
      },
    });
  } catch (error) {
    console.error(error);
    return new NextResponse("Error generating image", { status: 500 });
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const url = new URL(req.url);
    const quizId = url.searchParams.get("quiz_id");
    const percentage = 85; // Example percentage, replace with actual calculation
    const elapsedTime = "2:34"; // Example time, replace with actual calculation

    if (!quizId) {
      return new NextResponse("Missing quiz_id", { status: 400 });
    }

    return sendFinalResults(percentage, quizId, elapsedTime);
  } catch (error) {
    console.error(error);
    return new NextResponse("Error processing request", { status: 500 });
  }
}
