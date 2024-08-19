import React from "react";
import QuizList from "./components/QuizList";
import { getQuizzes } from "@/middleware/quiz";
import Link from "next/link";

export default async function page() {
  const quizzes = await getQuizzes();

  if (!quizzes) return <div>No quizzes Found</div>;
  return (
    <div>
      <Link
        href="/quiz/create"
        className="rounded-lg bg-blue-500 px-4 py-2 text-gray-100 text-xl mt-4"
      >
        Create a Quiz
      </Link>
      <QuizList quizzes={quizzes} />
    </div>
  );
}
