import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { checkPrivyAuth, getPrivyUserByDid } from "@/middleware/auth";

export async function POST(req: Request) {
  // get Authorization token from header
  const authToken =
    req.headers.get("Authorization")?.replace("Bearer ", "") ?? "";
  const verified = await checkPrivyAuth(authToken);

  if (!verified) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  //   fetch member data from privy
  const member = await getPrivyUserByDid(verified.userId);
  if (!member) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }
  //   add new member to supabase
  const supabase = createClient(
    process.env.SUPABASE_URL ?? "",
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? ""
  );

  //   perform logic
  try {
    // save farcaster login
    if (member.farcaster) {
      await supabase.from("members").insert([
        {
          privy_did: member.id,
          fid: member.farcaster.fid,
        },
      ]);
    }
    // save wallet login
    if (member.wallet) {
      await supabase.from("members").insert([
        {
          privy_did: member.id,
          linked_addresses: [member.wallet.address],
        },
      ]);
    }
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Error adding member" }, { status: 500 });
  } finally {
    return NextResponse.json({ message: "Member added" }, { status: 200 });
  }
}
