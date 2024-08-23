"use client";
import { usePrivy } from "@privy-io/react-auth";
import React from "react";
import SubmissionList from "./SubmissionList";
import { IQuestion, ISubmissionWithUser } from "@/types/quiz";
import QuizTaker from "./QuizTaker";

interface IProps {
  submissionsWithUsers: ISubmissionWithUser[];
  quizQuestions: IQuestion[] | undefined;
}

export default function QuizContainer(props: IProps) {
  const { submissionsWithUsers, quizQuestions } = props;
  const { user } = usePrivy();
  const fid = user?.farcaster?.fid?.toString() || null;

  return (
    <div className="my-4 w-full">
      {/* show the results only if they have taken the quiz */}
      {submissionsWithUsers.find(
        (submission) =>
          submission.submission.fid === fid &&
          submission.submission.score !== null
      ) ? (
        <div>
          <h2 className="text-2xl font-semibold mt-5">Quiz Stats</h2>
          {submissionsWithUsers.length > 0 ? (
            <SubmissionList
              submissionsWithUsers={submissionsWithUsers}
              quizQuestions={quizQuestions}
            />
          ) : (
            <p>No submissions yet</p>
          )}
        </div>
      ) : (
        <div>
          <h2 className="text-2xl font-semibold mt-5">Quiz</h2>
          <QuizTaker quizQuestions={quizQuestions} />
        </div>
      )}
    </div>
  );
}
