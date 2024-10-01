import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';
import { getCrowdfund, getCrowdfundABI } from '@/middleware/crowdfund';
import satori from "satori";
import sharp from "sharp";
import { join } from "path";
import * as fs from "fs";
import { NextRequest, NextResponse } from "next/server";

const fontPath = join(process.cwd(), "Roboto-Regular.ttf");
let fontData = fs.readFileSync(fontPath);

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id") || "";
    const fid = searchParams.get("fid") || "";

    if (!id) {
      return new NextResponse("Missing crowdfund id", { status: 400 });
    }

    // fetch contract from db
    const crowdfund = await getCrowdfund(id);
    if (!crowdfund) {
      return new NextResponse("Crowdfund not found", { status: 404 });
    }
    // Initialize the public client
    const publicClient = createPublicClient({ chain: base, transport: http() });
    
    // Fetch the ABI for the contract
    const contractABI = await getCrowdfundABI();

    // Replace this with the actual contract address you're using
    const contractAddress = crowdfund.contract_address;

    // Fetch total amount raised from the contract
    const totalRaised = await publicClient.readContract({
      address: contractAddress as `0x${string}`,
      abi: contractABI,
      functionName: 'totalRaisedInUSD',
      args: [],
    }) as bigint;
    // Add these to your existing parameters
    const name = crowdfund.name;
    const formattedTotalRaised = (Number(totalRaised) / 1e6).toFixed(2); // Assuming 6 decimal places

    const svg = await satori(
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          backgroundColor: "#1a1a1a",
          padding: "30px",
          fontFamily: "Roboto",
          color: "#fff",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "64px", fontWeight: "bold", marginBottom: "30px" }}>
          Thank You!
        </div>
        <div style={{ fontSize: "36px", marginBottom: "20px" }}>
          Your contribution to
        </div>
        <div style={{ fontSize: "48px", fontWeight: "bold", marginBottom: "30px" }}>
          {name}
        </div>
        <div style={{ fontSize: "36px", marginBottom: "20px" }}>
          has been received
        </div>
        <div style={{ fontSize: "72px", fontWeight: "bold", color: "#ff4136", marginTop: "20px" }}>
          ${formattedTotalRaised}
        </div>
        <div style={{ fontSize: "36px", color: "#aaa", marginTop: "10px" }}>
          Total raised so far: {formattedTotalRaised}
        </div>
      </div>,
      {
        width: 1148,
        height: 600,
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
        "Cache-Control": "max-age=0",
      },
    });
  } catch (error) {
    console.error(error);
    return new NextResponse("Error generating image", { status: 500 });
  }
}
