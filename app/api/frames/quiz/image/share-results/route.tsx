import sharp from "sharp";
import satori from "satori";
import { join } from "path";
import * as fs from "fs";
import { NextRequest, NextResponse } from "next/server";
import {
  getElapsedTimeString,
  getQuiz,
  getSubmissionById,
  getSubmissions,
} from "@/middleware/quiz";

const fontPath = join(process.cwd(), "Roboto-Regular.ttf");
let fontData = fs.readFileSync(fontPath);

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url);
    const submissionId = searchParams.get("submissionId") ?? "0";

    // get submission
    const submission = await getSubmissionById(Number(submissionId));
    if (!submission) {
      return new NextResponse("Submission not found", { status: 404 });
    }
    // get quiz
    const quiz = await getQuiz(submission.quiz_id);
    if (!quiz) {
      return new NextResponse("Quiz not found", { status: 404 });
    }

    // get all submissions for quiz
    const submissions = await getSubmissions(quiz.id);
    if (!submissions) {
      return new NextResponse("No submissions found", { status: 404 });
    }
    // remove all submissions that do not have a score
    const completedSubmissions = submissions.filter(
      (sub) => sub.score !== null
    );

    // get average score for quiz using completedSubmissions
    const averageScore =
      completedSubmissions.reduce((acc, sub) => acc + (sub.score ?? 0), 0) /
      completedSubmissions.length;
    const score = submission.score ?? 0;
    const time = submission.time_completed ?? "N/A";
    const fid = submission.fid ?? "N/A";
    const averageTime = Math.floor(
      completedSubmissions.reduce(
        (acc, sub) => acc + Number(sub.time_completed ?? 0),
        0
      ) / completedSubmissions.length
    );

    const elapsedTime = getElapsedTimeString(
      submission.created_at,
      submission.time_completed
    );

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
        <h1
          style={{
            backgroundColor: "#ffcc00",
            padding: "5px 20px",
            color: "#000",
            fontSize: "32px",
            fontWeight: "bold",
            textTransform: "uppercase",
          }}
        >
          Final Results
        </h1>
        <h2
          style={{
            fontSize: "32px",
            fontWeight: "bold",
            marginBottom: "20px",
            textShadow: "2px 2px #000",
          }}
        >
          <span
            style={{
              color: "#ffcc00",
              marginLeft: "8px",
              borderColor: "#fff",
              borderBottom: "2px",
            }}
          >
            {quiz.title}
          </span>
        </h2>
        <h2
          style={{
            fontSize: "50px",
            fontWeight: "bold",
            marginBottom: "20px",
            textShadow: "2px 2px #000",
          }}
        >
          Score:
          <span
            style={{
              color: "#ffcc00",
              marginLeft: "8px",
            }}
          >
            {score}%
          </span>
        </h2>
        <h2
          style={{
            fontSize: "32px",
            fontWeight: "bold",
            marginBottom: "20px",
            textShadow: "2px 2px #000",
          }}
        >
          Farcaster ID:
          <span
            style={{
              color: "#ffcc00",
              marginLeft: "8px",
            }}
          >
            {fid}
          </span>
        </h2>

        <h3
          style={{
            fontSize: "32px",
            fontWeight: "normal",
            textShadow: "1px 1px #000",
          }}
        >
          Time:
          <span
            style={{
              color: "#ffcc00",
              marginLeft: "8px",
            }}
          >
            {elapsedTime}
          </span>
        </h3>
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
