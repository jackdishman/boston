
import { NextRequest, NextResponse } from "next/server";
import { checkPrivyAuth, getPrivyUserByDid } from "@/middleware/auth";
import { getRecentFollows } from "@/middleware/helpers";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  // get Authorization token from header
  const authToken =
    req.headers.get("Authorization")?.replace("Bearer ", "") ?? "";
  const verified = await checkPrivyAuth(authToken);

  if (!verified) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { contractAddress, name, description } = await req.json();
  //   perform logic
  const supabase = createClient(
    process.env.SUPABASE_URL ?? "",
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? ""
  );

  try {
    const { data, error } = await supabase
      .from("crowdfunds")
      .insert({ contract_address: contractAddress, name, description })
      .select();
    return NextResponse.json({ data, error }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error adding member" }, { status: 500 });
  }
}
