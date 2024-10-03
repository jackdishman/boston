"use client";
import React from "react";
import { usePrivy } from "@privy-io/react-auth";
import { IAnswerEntry, IQuestion, ISubmission } from "@/types/quiz";
import MintResults from "./MintResults";
import { INeynarUserResponse } from "@/types/interfaces";

interface IProps {
  id: string;
  quizId: number;
  submissions: ISubmission[];
  joinedData: Map<number, { submission: IAnswerEntry; question: IQuestion }>;
  quizTaker: INeynarUserResponse;
  score: number;
  proctor: INeynarUserResponse;
}

export default function PageContainer(props: IProps) {
  const { id, quizId, submissions, joinedData, quizTaker, score, proctor } = props;
  const { user } = usePrivy();

  // check if user is authorized to view this quiz
  console.log(`user farcaster fid`, user?.farcaster?.fid)
  console.log(`proctor farcaster fid`, proctor.fid)
  console.log(`submissions[0].fid`, submissions[0].fid)
  
  if (
    user?.farcaster?.fid !== submissions[0].fid &&
    Number(proctor.fid) !== user?.farcaster?.fid
  ) {
    return <div>Unauthorized</div>;
  }

  const submission = submissions.find((s) => s.id === Number(id));



  return (
    <div>
      {/* Mint Results */}
      {submission && <MintResults submission={submission} quizId={quizId} quizTaker={quizTaker.verified_addresses.eth_addresses[0]} score={score} timeCompleted={0} proctor={proctor} />}
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
