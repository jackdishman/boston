import { checkPrivyAuth } from "@/middleware/auth";
import { addEvent, getEvents } from "@/middleware/events";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, res: NextResponse) {
  // get data from body
  //   const request = await req.json();

  // get Authorization token from header
  const authToken =
    req.headers.get("Authorization")?.replace("Bearer ", "") ?? "";
  const verified = await checkPrivyAuth(authToken);

  if (!verified) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const events = await getEvents();
    return NextResponse.json({ events });
  } catch (error) {
    return NextResponse.json({ error: "Error fetching more users" });
  }
}

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
    // add event
    const event = await addEvent(request.event);
    return NextResponse.json({ event });
  } catch (error) {
    return NextResponse.json({ error: "Error adding event" });
  }
}
