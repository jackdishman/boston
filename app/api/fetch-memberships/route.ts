import { checkPrivyAuth } from "@/middleware/auth";
import { getChannelMemberships } from "@/middleware/helpers";
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
    const { members, next_cursor } = await getChannelMemberships(
      request.fid,
      request.cursor
    );
    return NextResponse.json({ members, next_cursor });
  } catch (error) {
    return NextResponse.json({ error: "Error fetching memberships" });
  }
}
