import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import satori from "satori";
import { join } from "path";
import * as fs from "fs";

const fontPath = join(process.cwd(), "Roboto-Regular.ttf");
let fontData = fs.readFileSync(fontPath);

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url);
    const answer = searchParams.get("answer") ?? "";
    const isCorrect = searchParams.get("correct") ?? "false";
    const explanation = searchParams.get("explanation") ?? "";
    const time = searchParams.get("time") ?? "";
    const progress = searchParams.get("progress") ?? "";

    const svg = await satori(
      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#222",
          padding: "0px",
          border: "10px solid #ffcc00",
          fontFamily: "Roboto",
          color: "#fff",
          boxShadow: "0 0 20px rgba(0, 0, 0, 0.5)",
          display: "flex",
          flexDirection: "column",
          textAlign: "center",
          position: "relative",
        }}
      >
        {/* Top header: progress, time */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            left: "0",
            right: "0",
          }}
        >
          <div
            style={{
              display: "flex",
              backgroundColor: "#ffcc00",
              padding: "5px 20px",
              color: "#000",
              fontSize: "24px",
              fontWeight: "bold",
              textTransform: "uppercase",
            }}
          >
            Question {progress}
          </div>
          <div
            style={{
              display: "flex",
              backgroundColor: "#ffcc00",
              padding: "5px 20px",
              color: "#000",
              fontSize: "24px",
              fontWeight: "bold",
              textTransform: "uppercase",
            }}
          >
            Time: {time}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
          }}
        >
          <h2
            style={{
              textAlign: "center",
              color: isCorrect === "true" ? "#0f0" : "#f00",
              fontSize: 96,
              fontWeight: "bold",
              textTransform: "uppercase",
            }}
          >
            {isCorrect === "true" ? "Correct" : "Incorrect"}
          </h2>
        </div>
        {isCorrect !== "true" ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <h2
              style={{
                textAlign: "center",
                fontSize: "64px",
                marginLeft: "10px",
              }}
            >
              Correct answer: {answer}
            </h2>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100px",
            }}
          >
            <h2
              style={{
                textAlign: "center",
                color: "#fff",
                fontSize: "64px",
              }}
            >
              Nice Job!
            </h2>
          </div>
        )}
        <h2 style={{ textAlign: "center", color: "#fff", fontSize: "32px" }}>
          {explanation}
        </h2>
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

export async function POST(): Promise<NextResponse> {
  return new NextResponse("Method not allowed", { status: 405 });
}
