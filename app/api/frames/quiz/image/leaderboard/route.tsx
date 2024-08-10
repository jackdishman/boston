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

    // Sort submissions by score (descending) and time taken (ascending)
    const sortedSubmissions = submissions.sort((a, b) => {
      const scoreA = a.score ?? 0;
      const scoreB = b.score ?? 0;

      if (scoreB === scoreA) {
        const timeA =
          new Date(a.time_completed ?? 0).getTime() -
          new Date(a.created_at).getTime();
        const timeB =
          new Date(b.time_completed ?? 0).getTime() -
          new Date(b.created_at).getTime();
        return timeA - timeB;
      }
      return scoreB - scoreA;
    });

    const topSubmissionsFidList = sortedSubmissions
      .slice(0, 5)
      .map((s) => s.fid);
    const users = await getUsersByFids(topSubmissionsFidList as string[]);

    const topPlayerScores = sortedSubmissions
      .slice(0, 5)
      .map((submission, index) => ({
        rank: index + 1,
        fid: submission.fid,
        score: submission.score ?? 0,
        fname:
          users.find((user) => user.fid === Number(submission.fid))?.username ||
          "Unknown",
        timeTaken: submission.time_completed
          ? `${(
              (new Date(submission.time_completed).getTime() -
                new Date(submission.created_at).getTime()) /
              1000
            ).toFixed(2)}s`
          : "N/A",
      }));

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
          alignItems: "center",
          textAlign: "center",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            left: "0",
            right: "0",
          }}
        >
          <div
            style={{
              backgroundColor: "#ffcc00",
              padding: "10px 40px",
              color: "#000",
              fontSize: "32px",
              fontWeight: "bold",
              textTransform: "uppercase",
              display: "flex",
            }}
          >
            Leaderboard
          </div>
        </div>
        <h2
          style={{
            textAlign: "center",
            color: "#fff",
            fontSize: "64px",
            display: "flex",
          }}
        >
          Top Players
        </h2>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            padding: "0 20px",
            boxSizing: "border-box",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              fontSize: "32px",
              marginBottom: "10px",
              paddingBottom: "10px",
            }}
          >
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              Rank
            </div>
            <div style={{ flex: 3, display: "flex", justifyContent: "center" }}>
              Farcaster Name
            </div>
            <div style={{ flex: 2, display: "flex", justifyContent: "center" }}>
              Score (%)
            </div>
            <div style={{ flex: 2, display: "flex", justifyContent: "center" }}>
              Time to Complete
            </div>
          </div>
          {topPlayerScores.map((s) => (
            <div
              key={s.rank}
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                fontSize: "32px",
                marginBottom: "10px",
              }}
            >
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                {s.rank}
              </div>
              <div
                style={{
                  flex: 3,
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                {s.fname}
              </div>
              <div
                style={{
                  flex: 2,
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                {s.score}%
              </div>
              <div
                style={{
                  flex: 2,
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                {s.timeTaken}
              </div>
            </div>
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
