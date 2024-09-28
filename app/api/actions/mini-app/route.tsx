import { validateMessage } from "@/middleware/farcaster";
import { NextRequest, NextResponse } from "next/server";

type ComposerActionFormResponse = {
  type: "form";
  title: string;
  url: string;
};

type ComposerActionMetadata = {
  type: "composer";
  name: string;
  icon: string;
  description: string;
  imageUrl: string;
  aboutUrl?: string;
  action: {
    type: "post";
  };
};

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { fid, fname } = await validateMessage(req);

    const body: ComposerActionFormResponse = {
      type: "form",
      title: "fid: " + fid,
      url: process.env.NEXT_PUBLIC_HOST + `/profile/${fid}`,
    };

    return new NextResponse(JSON.stringify(body), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return new NextResponse("Error processing request", { status: 500 });
  }
}

export async function GET(): Promise<NextResponse> {
  const body: ComposerActionMetadata = {
    type: "composer",
    name: "view-fid",
    icon: "id-badge",
    description: "Farcaster toolbelt",
    imageUrl: process.env.NEXT_PUBLIC_HOST + "/fc-og.png",
    aboutUrl: process.env.NEXT_PUBLIC_HOST + "/about",
    action: {
      type: "post",
    },
  };

  return new NextResponse(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
