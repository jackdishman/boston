import { getUsersByFids } from "@/middleware/helpers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, res: NextResponse) {
  // get data from body
  const request = await req.json();
  try {
    const usersBatch = await getUsersByFids(request.fids as string[]);
    return NextResponse.json({ users: usersBatch });
  } catch (error) {
    return NextResponse.json({ error: "Error fetching more users" });
  }
}
