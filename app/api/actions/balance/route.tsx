import { NextRequest, NextResponse } from "next/server";
import { validateMessage } from "@/middleware/farcaster";
import { getNativeBalance } from "@/middleware/alchemy";
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

    const baseBalance = await getNativeBalance(castSignerAddress, "base");
    const ethBalance = await getNativeBalance(castSignerAddress, "ethereum");

    // add event
    const event: IEvent = {
      fid: fid.toString(),
      display_name: fname ?? "Unknown",
      action: ` searched for user ${castAuthorFname} (${castAuthorFid})`,
    };
    const eventRes = await addEvent(event);

    const body = {
      type: "message",
      message: `mainnet: ${ethBalance.balance.toFixed(
        2
      )} ETH // base: ${baseBalance.balance.toFixed(
        2
      )} ETH. Click me for more 🧐`,
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
    name: "ETH balance checker",
    icon: "id-badge",
    description: "Check ETH balance of a caster on mainnet and base",
    aboutUrl: "https://dish.codes/",
    action: {
      type: "post",
      postUrl: "https://dish.codes/api/actions/balance",
    },
  };

  return new NextResponse(JSON.stringify(body), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
