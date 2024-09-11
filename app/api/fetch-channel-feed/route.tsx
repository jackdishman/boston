import { checkPrivyAuth } from "@/middleware/auth";
import { getChannelFeed, getChannelFollowers } from "@/middleware/helpers";
import { channel } from "diagnostics_channel";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, res: NextResponse) {
  // get data from body
  const request = await req.json();

  // get Authorization token from header
  const authToken =
    req.headers.get("Authorization")?.replace("Bearer ", "") ?? "";
  const verified = await checkPrivyAuth(authToken);

  if (!verified) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const feedBatch = await getChannelFeed(
      request.channelId,
      request.withRecasts,
      request.viewerFid,
      request.withReplies,
      25,
      request.cursor,
      request.shouldModerate
    );
    return NextResponse.json(feedBatch);
  } catch (error) {
    return NextResponse.json({ error: "Error fetching more users" });
  }
}
