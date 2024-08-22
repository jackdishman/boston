import React from "react";
import QuizList from "./components/QuizList";
import { getQuizStats, getQuizzes } from "@/middleware/quiz";
import Link from "next/link";
import { IQuizStats } from "@/types/quiz";

export default async function page() {
  const quizzes = await getQuizzes();
  const quizStats = new Map<number, IQuizStats>();

  if (!quizzes) return <div>No quizzes Found</div>;

  await Promise.all(
    quizzes.map(async (quiz) => {
      const stats = await getQuizStats(quiz.id);
      quizStats.set(quiz.id, stats);
    })
  );

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
      <QuizList quizzes={quizzes} quizStats={quizStats} />
    </div>
  );
}
