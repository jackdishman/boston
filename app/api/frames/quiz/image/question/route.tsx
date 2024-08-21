import sharp from "sharp";
import satori from "satori";
import { join } from "path";
import * as fs from "fs";
import { NextRequest, NextResponse } from "next/server";
import { getQuestionById } from "@/middleware/quiz";

const fontPath = join(process.cwd(), "Roboto-Regular.ttf");
let fontData = fs.readFileSync(fontPath);

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url);
    const time = searchParams.get("time") || "";
    const progress = searchParams.get("progress") || "";
    const questionId = searchParams.get("questionId");

    if (!questionId) {
      return new NextResponse("Missing questionId", { status: 400 });
    }

    const question = await getQuestionById(Number(questionId));
    if (!question) {
      return new NextResponse("Question not found", { status: 404 });
    }

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
        {/* question text */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
          }}
        >
          <h2 style={{ textAlign: "center", color: "#fff", fontSize: "48px" }}>
            {question.text}
          </h2>
        </div>
        {/* multiple choice and image */}
        <div
          style={{
            display: "flex",
          }}
        >
          {/* image */}
          {question.image_url && (
            <img
              src={question.image_url}
              width={350}
              height={350}
              style={{
                objectFit: "cover",
                marginLeft: "10px",
                marginRight: "20px",
              }}
            />
          )}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* multiple choice */}
            {question.options && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  marginTop: "5px",
                  marginLeft: "20px",
                  fontSize: "32px",
                }}
              >
                {question.options[0] && (
                  <p style={{ marginTop: "10px", marginBottom: "0px" }}>
                    A: {question.options[0]}
                  </p>
                )}
                {question.options[1] && (
                  <p style={{ marginTop: "10px", marginBottom: "0px" }}>
                    B: {question.options[1]}
                  </p>
                )}
                {question.options[2] && (
                  <p style={{ marginTop: "10px", marginBottom: "0px" }}>
                    C: {question.options[2]}
                  </p>
                )}
                {question.options[3] && (
                  <p style={{ marginTop: "10px", marginBottom: "0px" }}>
                    D: {question.options[3]}
                  </p>
                )}
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
