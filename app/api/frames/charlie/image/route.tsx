import sharp from "sharp";
import satori from "satori";
import { join } from "path";
import * as fs from "fs";
import { NextRequest, NextResponse } from "next/server";
import { getUsersByFids } from "@/middleware/helpers";

const fontPath = join(process.cwd(), "Roboto-Regular.ttf");
let fontData = fs.readFileSync(fontPath);

export async function GET(req: NextRequest) {
  const imgUrl = process.env.NEXT_PUBLIC_HOST + `/charlie-final.jpg`;

  const { searchParams } = new URL(req.url);
  const fid = searchParams.get("fid") || "";

  // Get user data from fid
  const user = await getUsersByFids([fid.toString()]);
  if (!user) {
    return new NextResponse("Error getting user data", { status: 500 });
  }

  console.log("user", user[0].pfp_url);

  try {
    let profilePicUrl = user[0].pfp_url;
    let profilePicBuffer: Buffer;

    // Fetch the profile picture using Next.js's fetch
    const response = await fetch(profilePicUrl);
    const imageBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(imageBuffer);

    // Convert GIF to PNG if necessary
    if (profilePicUrl.endsWith(".gif")) {
      profilePicBuffer = await sharp(buffer).toFormat("png").toBuffer();
    } else {
      profilePicBuffer = buffer;
    }

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
        {/* profile pic */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            bottom: 75,
            right: 155,
          }}
        >
          <img
            src={`data:image/png;base64,${profilePicBuffer.toString("base64")}`}
            style={{
              width: "180px",
              height: "180px",
              borderRadius: "50%",
              border: "10px",
              borderStyle: "solid",
              borderColor: "black",
            }}
          />
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
