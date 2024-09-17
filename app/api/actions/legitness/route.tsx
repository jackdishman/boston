import { NextRequest, NextResponse } from "next/server";
import { validateMessage } from "@/middleware/farcaster";
import { getIcebreakerProfile } from "@/middleware/helpers";
import { addEvent } from "@/middleware/events";
import { IEvent } from "@/types/interfaces";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { fid, castSignerAddress, castAuthorFid, fname, castAuthorFname } =
      await validateMessage(req);

    if (!fid) {
      return new NextResponse("Missing fid", { status: 400 });
    }
    // fetch balances
    if (!castSignerAddress) {
      return new NextResponse("Missing address", { status: 400 });
    }

    if (!castAuthorFid) {
      const body = {
        type: "message",
        message: `No cast author id found`,
        link: process.env.NEXT_PUBLIC_HOST + "/profile/" + castAuthorFid,
      };

      return new NextResponse(JSON.stringify(body), {
        status: 200,
        headers: { "Content-Type": "text/json" },
      });
    }

    // fetch icebreaker profile
    const icebreakerRes = await getIcebreakerProfile(castAuthorFid.toString());
    const icebreakerProfile = icebreakerRes?.profiles[0];

    // add event
    const event: IEvent = {
      fid: fid.toString(),
      display_name: fname ?? "Unknown",
      action: ` checked legitness for user ${castAuthorFname} (${castAuthorFid})`,
    };
    const eventRes = await addEvent(event);

    // loop through credentials and make into string:

    if (!icebreakerProfile) {
      const body = {
        type: "message",
        message: `No Icebreaker profile found. Click me for more 🧐`,
        link: process.env.NEXT_PUBLIC_HOST + "/profile/" + castAuthorFid,
      };

      return new NextResponse(JSON.stringify(body), {
        status: 200,
        headers: { "Content-Type": "text/json" },
      });
    }

    let message = `${icebreakerProfile?.displayName}`;
    // loop through credentials and make into string:
    icebreakerProfile?.credentials.forEach((credential) => {
      message += `: ${credential.name}`;
    });
    // only include the first 80 characters in message
    const body = {
      type: "message",
      message: message.substring(0, 80),
      link: process.env.NEXT_PUBLIC_HOST + "/profile/" + castAuthorFid,
    };

    return new NextResponse(JSON.stringify(body), {
      status: 200,
      headers: { "Content-Type": "text/json" },
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return new NextResponse("Error processing request", { status: 500 });
  }
}

export async function GET(): Promise<NextResponse> {
  const body = {
    name: "Icebreaker Credentials",
    icon: "id-badge",
    description: "View tokens, verifications, and much more",
    aboutUrl: "https://dish.codes/",
    action: {
      type: "post",
      postUrl: "https://dish.codes/api/actions/legitness",
    },
  };

  return new NextResponse(JSON.stringify(body), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
