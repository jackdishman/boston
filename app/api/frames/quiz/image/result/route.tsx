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
          backgroundColor: "#111",
          padding: 10,
          lineHeight: 1.2,
          fontSize: 24,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* top header */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            padding: 10,
          }}
        >
          <p
            style={{
              color: `#fff`,
            }}
          >
            {progress}
          </p>
          <p
            style={{
              color: `#fff`,
            }}
          >
            {time}
          </p>
        </div>
        {/* question */}
        <div
          style={{
            justifyContent: "flex-start",
            alignItems: "center",
            display: "flex",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              padding: 0,
              justifyContent: "center",
            }}
          >
            <h2
              style={{
                textAlign: "center",
                color: isCorrect === "true" ? "#0f0" : "#f00",
                fontSize: 50,
                paddingLeft: "40%",
                textTransform: "uppercase",
              }}
            >
              {isCorrect === "true" ? "Correct" : "Incorrect"}
            </h2>
            <h2 style={{ textAlign: "center", color: "#fff", fontSize: 20 }}>
              {explanation}
            </h2>
          </div>
        </div>
      </div>,
      {
        width: 600,
        height: 400,
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

    // Convert SVG to PNG using Sharp
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
