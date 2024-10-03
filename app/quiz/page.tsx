import React from "react";
import QuizList from "./components/QuizList";
import { getQuizStats, getQuizzes } from "@/middleware/quiz";
import Link from "next/link";
import { IQuizStats } from "@/types/quiz";

export async function generateMetadata() {
  // get random quiz
  const quizzes = await getQuizzes();
  if (!quizzes) return;
  const quiz = quizzes[Math.floor(Math.random() * quizzes.length)];
  const id = quiz.id;
  const imageUrl = `${
    process.env["NEXT_PUBLIC_HOST"]
  }/api/frames/quiz/image?title=${"QuizCaster"}&description=${"Create a Quiz or take one"}`;
  const fcMetadata: Record<string, string> = {
    "fc:frame": "vNext",
    "fc:frame:post_url": `${process.env["NEXT_PUBLIC_HOST"]}/api/frames/quiz/question?quiz_id=${id}&question_id=${quiz.first_question_id}`,
    "fc:frame:image": imageUrl,
    "fc:frame:button:1": `Random Quiz`,
    "fc:frame:button:2": `View App`,
    "fc:frame:button:2:action": `link`,
    "fc:frame:button:2:target": `${process.env["NEXT_PUBLIC_HOST"]}/`,
    "fc:frame:button:3": `Create a Quiz`,
    "fc:frame:button:3:action": `link`,
    "fc:frame:button:3:target": `${process.env["NEXT_PUBLIC_HOST"]}/quiz/create`,
  };
  return {
    title: "QuizCaster",
    openGraph: {
      title: "QuizCaster",
      description:
        "Create fun quizzes with images, track responses, reward top scorers, and climb the leaderboard!",
      images: [{ url: imageUrl }],
    },
    other: {
      ...fcMetadata,
    },
    metadataBase: new URL(process.env["NEXT_PUBLIC_HOST"] || ""),
  };
}

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
          Create a Quiz
        </Link>
      </div>
      <QuizList quizzes={quizzes} quizStats={quizStats} />
    </div>
  );
}
