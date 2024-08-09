import { NextRequest, NextResponse } from "next/server";
import { checkPrivyAuth, getPrivyUserByDid } from "@/middleware/auth";
import { uploadQuiz } from "@/middleware/quiz";
import { IQuizBuilder, IQuestionBuilder } from "@/types/quiz";

export async function POST(req: NextRequest) {
  const authToken =
    req.headers.get("Authorization")?.replace("Bearer ", "") ?? "";
  const verified = await checkPrivyAuth(authToken);

  if (!verified) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const member = await getPrivyUserByDid(verified.userId);
  if (!member) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  try {
    const body = await req.json();
    const {
      quiz,
      questions,
    }: { quiz: IQuizBuilder; questions: IQuestionBuilder[] } = body;

    if (!quiz || !questions || !Array.isArray(questions)) {
      throw new Error("Invalid payload");
    }

    const newQuiz = await uploadQuiz(quiz, questions);
    if (!newQuiz) throw new Error("Error uploading quiz");

    return NextResponse.json({ id: newQuiz.id });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error adding quiz:", error.message);
    } else {
      console.error("An unexpected error occurred:", error);
    }
    return NextResponse.json({ error: "Error adding quiz" }, { status: 500 });
  }
}
