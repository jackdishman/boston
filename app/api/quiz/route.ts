import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { checkPrivyAuth } from "@/middleware/auth";
import { createSubmission } from "@/middleware/quiz";

export async function POST(req: Request) {
  // get Authorization token from header
  const authToken =
    req.headers.get("Authorization")?.replace("Bearer ", "") ?? "";
  const verified = await checkPrivyAuth(authToken);
  if (!verified) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const supabase = createClient(
    process.env.SUPABASE_URL ?? "",
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? ""
  );

  //   perform logic
  const { fid, quizId } = body;
  const { data: submission, error } = await supabase
    .from("submissions")
    .select("*")
    .eq("fid", fid)
    .eq("quiz_id", quizId)
    .single();
  if (error) {
    if (error.code === "PGRST116") {
      // create a new submission and return that
      const newSubmission = await createSubmission(quizId, fid);
      return NextResponse.json(newSubmission, { status: 200 });
    }
    return NextResponse.json({}, { status: 500 });
  }
  return NextResponse.json(submission, { status: 200 });
}
