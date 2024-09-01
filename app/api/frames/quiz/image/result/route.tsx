import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import satori from "satori";
import { join } from "path";
import * as fs from "fs";
import { getQuestionById } from "@/middleware/quiz";

const fontPath = join(process.cwd(), "Roboto-Regular.ttf");
let fontData = fs.readFileSync(fontPath);

function getRandomImage(isCorrect: boolean): string {
  // generate a random number between 1-10
  const random = Math.floor(Math.random() * 10) + 1;
  const imgUrl =
    process.env.NEXT_PUBLIC_HOST +
    "/quiz-assets/" +
    (isCorrect ? "correct" : "incorrect") +
    "-" +
    random +
    ".png";
  console.log(`Image URL: ${imgUrl}`);
  return imgUrl;
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url);
    const isCorrect = searchParams.get("correct") ?? "false";
    const time = searchParams.get("time") ?? "";
    const progress = searchParams.get("progress") ?? "";
    const questionId = searchParams.get("questionId") ?? "";

    const question = await getQuestionById(Number(questionId));
    if (!question) {
      return new NextResponse("Question not found", { status: 404 });
    }

    const answer = question.answer;
    const explanation = question.explanation;
    console.log(`Answer: ${answer}, Explanation: ${explanation}`);

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
            <div
              style={{
                display: "flex",
                alignItems: "center",
                fontSize: "24px",
              }}
            >
              <img
                src={getRandomImage(false)}
                width={350}
                height={350}
                style={{
                  objectFit: "cover",
                  marginLeft: "10px",
                  marginRight: "20px",
                }}
              />
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  textAlign: "left",
                  paddingRight: "20px",
                }}
              >
                <p
                  style={{
                    wordBreak: "break-word",
                    fontSize: "36px",
                    width: "650px",
                    color: "#ffcc00",
                  }}
                >
                  {answer}
                </p>
                <p
                  style={{
                    wordBreak: "break-word",
                    fontSize: "32px",
                    color: "#eee",
                    width: "650px",
                  }}
                >
                  {explanation}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
            }}
          >
            <img
              src={getRandomImage(true)}
              width={350}
              height={350}
              style={{
                objectFit: "cover",
                marginLeft: "10px",
              }}
            />
            <h2
              style={{
                color: "#eee",
                fontSize: "32px",
                width: "650px",
                wordBreak: "break-word",
                textAlign: "left",
                paddingLeft: "20px",
              }}
            >
              {explanation}
            </h2>
          </div>
        )}
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
