"use client";

import { ISubmission } from "@/types/quiz";
import { INeynarUserResponse } from "@/types/interfaces";

interface IProps {
  submissions: (ISubmission & INeynarUserResponse)[];
}

function getElapsedTime(timeCompleted: string, createdAt: string): string {
  const timeCompletedDate = new Date(timeCompleted);
  const createdAtDate = new Date(createdAt);
  const elapsedTime = timeCompletedDate.getTime() - createdAtDate.getTime();
  const hours = Math.floor(elapsedTime / 3600000);
  const minutes = Math.floor((elapsedTime % 3600000) / 60000);
  const seconds = Math.floor((elapsedTime % 60000) / 1000);
  return `${hours}h ${minutes}m ${seconds}s`;
}

export default function SubmissionList({ submissions }: IProps) {
  return (
    <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
      <div className="min-w-full grid grid-cols-4 bg-gray-50 dark:bg-gray-700 text-xs text-gray-700 uppercase dark:text-gray-400 font-medium">
        <div className="py-3 px-6">Farcaster Profile</div>
        <div className="py-3 px-6">Score</div>
        <div className="py-3 px-6">Time Completed</div>
        <div className="py-3 px-6">Date Created</div>
      </div>

      <div className="min-w-full grid grid-rows-auto">
        {submissions.map((data, index) => (
          <div
            key={index}
            className="grid grid-cols-4 py-4 px-6 bg-white dark:bg-gray-800 text-sm text-gray-500 dark:text-gray-400"
          >
            <div>
              <a
                href={`https://warpcast.con/${data.username}`}
                target="_blank"
                className="flex items-center"
              >
                <img src={data.pfp_url} className="w-8 h-8 rounded-full mr-2" />
                <span>
                  {data.username} ({data.fid})
                </span>
              </a>
            </div>
            <div>{data.score}</div>
            <div>
              {getElapsedTime(
                data.time_completed ?? new Date().toString(),
                data.created_at
              )}
            </div>
            <div>{new Date(data.created_at).toLocaleDateString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
