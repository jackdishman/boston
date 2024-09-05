import { checkPrivyAuth } from "@/middleware/auth";
import { getChannelFollowers } from "@/middleware/helpers";
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
    const usersBatch = await getChannelFollowers(
      request.channelId,
      request.cursor
    );
    return NextResponse.json({ users: usersBatch, cursor: usersBatch.cursor });
  } catch (error) {
    return NextResponse.json({ error: "Error fetching more users" });
  }
}
