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
    console.log(`image-question time and progress`, time, progress);

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
              padding: 20,
            }}
          >
            <h2 style={{ textAlign: "center", color: "#fff" }}>{text}</h2>
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

export async function POST() {
  return new NextResponse("Method not allowed", { status: 405 });
}
