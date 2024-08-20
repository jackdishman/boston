import sharp from "sharp";
import satori from "satori";
import { join } from "path";
import * as fs from "fs";
import { NextRequest, NextResponse } from "next/server";

const fontPath = join(process.cwd(), "Roboto-Regular.ttf");
let fontData = fs.readFileSync(fontPath);

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url);
    const text = searchParams.get("text") || "Default Text";
    const time = searchParams.get("time") || "";
    const progress = searchParams.get("progress") || "";
    const optionA = searchParams.get("optionA");
    const optionB = searchParams.get("optionB");
    const optionC = searchParams.get("optionC");
    const optionD = searchParams.get("optionD");

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
            height: "100%",
            flexDirection: "column",
          }}
        >
          <h2 style={{ textAlign: "center", color: "#fff", fontSize: "48px" }}>
            {text}
          </h2>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginTop: "5px",
              marginLeft: "20px",
              fontSize: "32px",
            }}
          >
            {optionA && (
              <p style={{ marginTop: "10px", marginBottom: "0px" }}>
                A: {optionA}
              </p>
            )}
            {optionB && (
              <p style={{ marginTop: "10px", marginBottom: "0px" }}>
                B: {optionB}
              </p>
            )}
            {optionC && (
              <p style={{ marginTop: "10px", marginBottom: "0px" }}>
                C: {optionC}
              </p>
            )}
            {optionD && (
              <p style={{ marginTop: "10px", marginBottom: "0px" }}>
                D: {optionD}
              </p>
            )}
          </div>
        </div>
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

export async function POST() {
  return new NextResponse("Method not allowed", { status: 405 });
}
