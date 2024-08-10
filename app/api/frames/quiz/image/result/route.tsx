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
          Result
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            padding: 10,
            width: "100%",
          }}
        >
          <p>{progress}</p>
          <p>{time}</p>
        </div>
        <h2
          style={{
            textAlign: "center",
            color: isCorrect === "true" ? "#0f0" : "#f00",
            fontSize: 50,
            textTransform: "uppercase",
          }}
        >
          {isCorrect === "true" ? "Correct" : "Incorrect"}
        </h2>
        <h2 style={{ textAlign: "center", color: "#fff", fontSize: 20 }}>
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
