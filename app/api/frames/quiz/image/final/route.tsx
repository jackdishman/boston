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
    const score = searchParams.get("score") ?? "0%";
    const time = searchParams.get("time") ?? "";
    const progress = searchParams.get("progress") ?? "";
    const totalPoints = searchParams.get("totalPoints") ?? "0";

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
          Final Results
        </div>
        <h2
          style={{
            fontSize: "50px",
            fontWeight: "bold",
            marginBottom: "20px",
            textShadow: "2px 2px #000",
          }}
        >
          You Scored {score}%
        </h2>
        <h3
          style={{
            fontSize: "32px",
            fontWeight: "normal",
            color: "#ffcc00",
            textShadow: "1px 1px #000",
          }}
        >
          Time: {time}
        </h3>
        <h3
          style={{
            fontSize: "32px",
            fontWeight: "normal",
            textShadow: "1px 1px #000",
          }}
        >
          Points: <span style={{ color: "#00ff00" }}>{totalPoints}</span>
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
