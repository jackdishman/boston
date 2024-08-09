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
  const fid = url.searchParams.get("fid") || "";

  try {
    // Get quiz submissions
    const submissions = await getSubmissions(Number(quizId));
    if (!submissions || submissions.length === 0) {
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
          <p
            style={{
              color: `#fff`,
            }}
          >
            No submissions yet
          </p>
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

    // Get top 5 submissions
    const topSubmissionsFidList =
      submissions.length > 0 ? submissions.slice(0, 5).map((s) => s.fid) : [];
    const users = await getUsersByFids(topSubmissionsFidList as string[]);

    const topPlayerScores = topSubmissionsFidList.map((fid, index) => ({
      fid,
      score: submissions[index].score,
      fname:
        users.find((user) => user.fid === Number(fid))?.username || "Unknown",
    }));

    console.log(topPlayerScores);

    const svg = await satori(
      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#111",
          padding: 40,
          lineHeight: 1.2,
          fontSize: 24,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <p
          style={{
            color: `#fff`,
          }}
        >
          Top 5 Submissions
        </p>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            color: `#fff`,
          }}
        >
          {topPlayerScores.map((s, index) => (
            <p key={index}>
              {s.fname} - {s.score}
            </p>
          ))}
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
