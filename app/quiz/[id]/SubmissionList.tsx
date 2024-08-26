"use client";

import { IQuestion, ISubmissionWithUser } from "@/types/quiz";
import { getElapsedTimeString } from "@/middleware/quiz";
import Image from "next/image";
import { useState } from "react";
import Link from "next/link";

interface IProps {
  submissionsWithUsers: ISubmissionWithUser[];
  quizQuestions: IQuestion[] | undefined;
}

export default function SubmissionList({
  submissionsWithUsers,
  quizQuestions,
}: IProps) {
  return (
    <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
      <div className="min-w-full grid grid-cols-6 bg-gray-50 dark:bg-gray-700 text-xs text-gray-700 uppercase dark:text-gray-400 font-medium">
        <div className="py-3 px-6 col-span-2">Farcaster Profile</div>
        <div className="py-3 px-6">Score</div>
        <div className="py-3 px-6">Time</div>
        <div className="py-3 px-6">Date</div>
      </div>

      <div className="min-w-full grid grid-rows-auto">
        {submissionsWithUsers.map((data, index) => (
          <div
            key={index}
            className="grid grid-cols-6 py-4 px-6 bg-white dark:bg-gray-800 text-sm text-gray-500 dark:text-gray-400"
          >
            <div className="col-span-2">
              <a
                href={`https://warpcast.com/${data.user.display_name}`}
                target="_blank"
                className="flex items-center"
              >
                <Image
                  src={data.user.pfp_url}
                  alt={data.user.username}
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full mr-2"
                />
                <span className="text-xs sm:text-base">
                  {data.user.username} ({data.user.fid})
                </span>
              </a>
            </div>
            <div>{data.submission.score ?? 0}%</div>
            <div>
              {data.submission.time_completed
                ? getElapsedTimeString(
                    data.submission.created_at,
                    data.submission.time_completed
                  )
                : "DNC"}
            </div>
            <div>
              {new Date(data.submission.created_at).toLocaleDateString()}
            </div>
            <Link href={`/quiz/results/${data.submission.id}`}>Results</Link>
          </div>
        ))}
      </div>
      <SubmissionBreakdown
        submissionsWithUsers={submissionsWithUsers}
        quizQuestions={quizQuestions}
      />
    </div>
  );
}

const SubmissionBreakdown = ({
  submissionsWithUsers,
  quizQuestions,
}: IProps) => {
  const [sortOrder, setSortOrder] = useState<"hardest" | "easiest">("hardest");

  const questions = quizQuestions?.map((question) => question.id) || [];

  let breakdown = questions.map((questionId) => {
    const answeredSubmissions = submissionsWithUsers.filter((data) =>
      data.submission.answers.some(
        (answer) => answer.question_id === questionId
      )
    );

    const correct = answeredSubmissions.filter((data) =>
      data.submission.answers.some(
        (answer) => answer.question_id === questionId && answer.is_correct
      )
    );

    const incorrect = answeredSubmissions.filter((data) =>
      data.submission.answers.some(
        (answer) => answer.question_id === questionId && !answer.is_correct
      )
    );

    return { questionId, correct, incorrect, answeredSubmissions };
  });

  // Sort the breakdown based on the sortOrder state
  breakdown = breakdown.sort((a, b) => {
    const aCorrectPercentage =
      a.correct.length / a.answeredSubmissions.length || 0;
    const bCorrectPercentage =
      b.correct.length / b.answeredSubmissions.length || 0;
    return sortOrder === "hardest"
      ? aCorrectPercentage - bCorrectPercentage
      : bCorrectPercentage - aCorrectPercentage;
  });

  return (
    <div className="min-w-full p-4 bg-gray-50 dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-300 font-medium">
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setSortOrder("hardest")}
          className={`px-4 py-2 rounded-l-lg ${
            sortOrder === "hardest"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-400"
          }`}
        >
          Hardest First
        </button>
        <button
          onClick={() => setSortOrder("easiest")}
          className={`px-4 py-2 rounded-r-lg ${
            sortOrder === "easiest"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-400"
          }`}
        >
          Easiest First
        </button>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {breakdown.map((data) => (
          <div
            key={data.questionId}
            className="bg-white dark:bg-gray-900 shadow-md rounded-lg p-4"
          >
            <div className="flex flex-col space-y-2">
              <p className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                Question:{" "}
                {
                  quizQuestions?.find(
                    (question) => question.id === data.questionId
                  )?.text
                }
              </p>
              <div className="flex flex-col space-y-1">
                <p className="text-green-500">
                  Correct: {data.correct.length} (
                  {Math.round(
                    (data.correct.length / data.answeredSubmissions.length) *
                      100
                  )}
                  %)
                </p>
                <p className="text-red-500">
                  Incorrect: {data.incorrect.length} (
                  {Math.round(
                    (data.incorrect.length / data.answeredSubmissions.length) *
                      100
                  )}
                  %)
                </p>
              </div>
              <div className="mt-2 border-t border-gray-200 dark:border-gray-700 pt-2">
                {quizQuestions
                  ?.find((question) => question.id === data.questionId)
                  ?.options?.map((option, index) => {
                    const selected = submissionsWithUsers.filter((user) =>
                      user.submission.answers.find(
                        (answer) =>
                          answer.question_id === data.questionId &&
                          answer.answer === option
                      )
                    );
                    return (
                      <p
                        key={index}
                        className="text-gray-700 dark:text-gray-300"
                      >
                        {option}: {selected.length}
                      </p>
                    );
                  })}
                {quizQuestions?.find(
                  (question) => question.id === data.questionId
                )?.question_type === "short_answer" && (
                  <p className="text-gray-700 dark:text-gray-300">
                    Correct Answer:{" "}
                    {
                      quizQuestions?.find(
                        (question) => question.id === data.questionId
                      )?.answer
                    }
                    : {data.correct.length}
                  </p>
                )}

                {quizQuestions?.find(
                  (question) => question.id === data.questionId
                )?.question_type === "short_answer" &&
                  data.incorrect.map((user, index) => (
                    <p
                      key={index}
                      className="text-sm text-gray-500 dark:text-gray-400"
                    >
                      {user.user.username}
                    </p>
                  ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
