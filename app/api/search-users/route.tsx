import { checkPrivyAuth } from "@/middleware/auth";
import { getUsersByFids, getUsersByName } from "@/middleware/helpers";
import { INeynarUserResponse } from "@/types/interfaces";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, res: NextResponse) {
  // get data from body
  const request = await req.json();
  const search = request.search as string;

  // get Authorization token from header
  const authToken =
    req.headers.get("Authorization")?.replace("Bearer ", "") ?? "";
  const verified = await checkPrivyAuth(authToken);

  if (!verified) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // if search only containes numbers, search by id
    let fidUsers: INeynarUserResponse[] = [];
    let nameUsers: INeynarUserResponse[] = [];
    if (/^\d+$/.test(search)) {
      fidUsers = await getUsersByFids([search]);
    }
    nameUsers = await getUsersByName(search);
    return NextResponse.json([...fidUsers, ...nameUsers]);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
