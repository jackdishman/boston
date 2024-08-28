import sharp from "sharp";
import satori from "satori";
import { join } from "path";
import * as fs from "fs";
import { NextRequest, NextResponse } from "next/server";
import { getUsersByFids } from "@/middleware/helpers";

const fontPath = join(process.cwd(), "Roboto-Regular.ttf");
let fontData = fs.readFileSync(fontPath);

export async function GET(req: NextRequest & { query: { fid: string } }) {
  const imgUrl = process.env.NEXT_PUBLIC_HOST + `/charlie-final.jpg`;

  const { searchParams } = new URL(req.url);
  const fid = searchParams.get("fid") || "";

  //   get user data from fid

  const user = await getUsersByFids([fid.toString()]);
  if (!user) {
    return new NextResponse("Error getting user data", { status: 500 });
  }

  console.log("user", user[0].pfp_url);

  try {
    const svg = await satori(
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          position: "relative",
        }}
      >
        <img src={imgUrl} style={{ width: "100%", height: "100%" }} />
        <div style={{ display: "flex", position: "absolute", top: 0, left: 0 }}>
          <img
            src={user[0].pfp_url}
            style={{
              width: "24px",
              height: "24px",
              borderRadius: "50%",
            }}
          />
          <p>asdf</p>
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
        "Cache-Control": "max-age=10", // Set max-age to 10 seconds
      },
    });
  } catch (error) {
    return new NextResponse("Error generating image", { status: 500 });
  }
}
