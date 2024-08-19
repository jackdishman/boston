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
    const previousAnswer = searchParams.get("previousAnswer") || "";
    const isCorrect = searchParams.get("isCorrect") || "";
    const time = searchParams.get("time") || "";
    const progress = searchParams.get("progress") || "";
    const correctAnswer = searchParams.get("correctAnswer") || "";

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
            You've completed {progress} questions.
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
            flexDirection: "column",
            justifyContent: "center",
            // alignItems: "center",
            height: "100%",
          }}
        >
          <h2 style={{ textAlign: "center", color: "#fff", fontSize: "50px" }}>
            {text}
          </h2>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: "32px",
            }}
          >
            You answered{" "}
            <span
              style={{
                color: "#ffcc00",
                fontSize: "32px",
                marginLeft: "10px",
                marginRight: "10px",
              }}
            >
              {previousAnswer}
            </span>{" "}
            which was
            {isCorrect === "true" ? (
              <h2
                style={{
                  color: "#00ff00",
                  fontSize: "48px",
                  marginLeft: "10px",
                }}
              >
                Correct
              </h2>
            ) : (
              <h2
                style={{
                  color: "#ff0000",
                  fontSize: "48px",
                  marginLeft: "10px",
                }}
              >
                Incorrect
              </h2>
            )}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
            }}
          >
            {isCorrect === "true" ? (
              <h2
                style={{
                  color: "#00ff00",
                  fontSize: "48px",
                }}
              >
                Great job!!!
              </h2>
            ) : (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  fontSize: "32px",
                }}
              >
                <h2 style={{}}>Correct Answer is</h2>
                <h2
                  style={{
                    color: "#ffcc00",
                    fontSize: "52px",
                    marginLeft: "5px",
                  }}
                >
                  {correctAnswer}
                </h2>
              </div>
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
