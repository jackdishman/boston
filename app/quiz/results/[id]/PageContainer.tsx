"use client";
import React from "react";
import { usePrivy } from "@privy-io/react-auth";
import { IAnswerEntry, IQuestion, ISubmission } from "@/types/quiz";
import Link from "next/link";

interface IProps {
  id: string;
  quizId: number;
  proctorFid: string;
  submissions: ISubmission[];
  joinedData: Map<number, { submission: IAnswerEntry; question: IQuestion }>;
}

export default function PageContainer(props: IProps) {
  const { id, quizId, proctorFid, submissions, joinedData } = props;
  const { user } = usePrivy();

  // check if user is authorized to view this quiz
  if (
    user?.farcaster?.fid !== submissions[0].fid &&
    Number(proctorFid) !== user?.farcaster?.fid
  ) {
    return <div>Unauthorized</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <Link
        href={`/quiz/${quizId}`}
        className="text-blue-500 p-4 flex items-center mb-6"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 19.5 8.25 12l7.5-7.5"
          />
        </svg>
        Back
      </Link>
      <h1 className="text-2xl font-bold mb-6">Quiz Details for ID: {id}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from(joinedData).map(([key, value]) => (
          <div key={key} className="border rounded-lg p-4 shadow-sm bg-gray-50">
            <h2 className="text-lg font-semibold mb-3">
              {value.question.text}
            </h2>
            <div className="space-y-3">
              <p>
                <span className="font-medium">Answer:</span>{" "}
                <span
                  className={`${
                    value.submission.is_correct
                      ? "text-green-600"
                      : "text-red-600"
                  } font-semibold`}
                >
                  {value.submission.answer}
                </span>
              </p>
              <p>
                <span className="font-medium">Correct Answer:</span>{" "}
                {value.question.answer}
              </p>
              <p>
                <span className="font-medium">Correct:</span>{" "}
                {value.submission.is_correct ? (
                  <span className="text-green-600 font-semibold">Yes</span>
                ) : (
                  <span className="text-red-600 font-semibold">No</span>
                )}
              </p>
              {value.question.explanation && (
                <p>
                  <span className="font-medium">Explanation:</span>{" "}
                  {value.question.explanation}
                </p>
              )}
              {value.question.image_url && (
                <div className="mt-3">
                  <img
                    src={value.question.image_url}
                    alt={value.question.text}
                    className="w-full h-auto rounded-lg shadow-md"
                  />
                </div>
              )}
              {value.question.options && value.question.options.length > 0 && (
                <div className="mt-3">
                  <p className="font-medium">Options:</p>
                  <ul className="list-disc list-inside pl-4 space-y-1">
                    {value.question.options.map((option, index) => (
                      <li key={index} className="text-gray-700">
                        {option}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="text-sm text-gray-500 mt-4">
                <p>
                  <span className="font-medium">Question Type:</span>{" "}
                  {value.question.question_type}
                </p>
                {value.question.next_question_id && (
                  <p>
                    <span className="font-medium">Next Question ID:</span>{" "}
                    {value.question.next_question_id}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
