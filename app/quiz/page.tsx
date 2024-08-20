import React from "react";
import QuizList from "./components/QuizList";
import { getQuizzes } from "@/middleware/quiz";
import Link from "next/link";

export default async function page() {
  const quizzes = await getQuizzes();

  if (!quizzes) return <div>No quizzes Found</div>;
  return (
    <div>
      <div className="mx-4 my-8 flex justify-center">
        <Link
          href="/quiz/create"
          className="rounded-lg bg-blue-500 px-4 py-2 text-gray-100 text-xl"
        >
          Create a Trivia Quiz
        </Link>
      </div>
      <QuizList quizzes={quizzes} />
    </div>
  );
}
