import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import satori from "satori";
import { join } from "path";
import * as fs from "fs";
import { getSubmissions } from "@/middleware/quiz";
import { getUsersByFids } from "@/middleware/helpers";

const fontPath = join(process.cwd(), "Roboto-Regular.ttf");
let fontData = fs.readFileSync(fontPath);

export async function GET(req: NextRequest): Promise<NextResponse> {
  const url = new URL(req.url);
  const quizId = url.searchParams.get("quiz_id") || "";

  try {
    const submissions = await getSubmissions(Number(quizId));
    if (!submissions || submissions.length === 0) {
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
            Leaderboard
          </div>
          <h2 style={{ textAlign: "center", color: "#fff" }}>
            No submissions yet
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

      const pngBuffer = await sharp(Buffer.from(svg))
        .toFormat("png")
        .toBuffer();
      return new NextResponse(pngBuffer, {
        status: 200,
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "max-age=10",
        },
      });
    }

    const topSubmissionsFidList =
      submissions.length > 0 ? submissions.slice(0, 5).map((s) => s.fid) : [];
    const users = await getUsersByFids(topSubmissionsFidList as string[]);

    const topPlayerScores = topSubmissionsFidList.map((fid, index) => ({
      fid,
      score: submissions[index].score,
      fname:
        users.find((user) => user.fid === Number(fid))?.username || "Unknown",
    }));

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
          Leaderboard
        </div>
        <h2 style={{ textAlign: "center", color: "#fff" }}>
          Top 5 Submissions
        </h2>
        <div
          style={{ display: "flex", flexDirection: "column", color: `#fff` }}
        >
          {topPlayerScores.map((s, index) => (
            <p key={index}>
              {s.fname} - {s.score}
            </p>
          ))}
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

export async function POST(): Promise<NextResponse> {
  return new NextResponse("Method not allowed", { status: 405 });
}
