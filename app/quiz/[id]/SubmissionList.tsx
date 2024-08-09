import { ISubmission } from "@/types/quiz";
import React from "react";

interface IProps {
  submissions: ISubmission[];
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

export default function SubmissionList(props: IProps) {
  const { submissions } = props;
  return (
    <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" className="py-3 px-6">
              Farcaster ID
            </th>
            <th scope="col" className="py-3 px-6">
              Score
            </th>
            <th scope="col" className="py-3 px-6">
              Time Completed
            </th>
            <th scope="col" className="py-3 px-6">
              Date Created
            </th>
          </tr>
        </thead>
        <tbody>
          {submissions.map((submission) => (
            <tr
              className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
              key={submission.id}
            >
              <th
                scope="row"
                className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap dark:text-white"
              >
                {submission.fid}
              </th>
              <td className="py-4 px-6">{submission.score}</td>
              <td className="py-4 px-6">
                {submission.time_completed && (
                  <span>
                    {new Date(submission.time_completed).toLocaleDateString()}
                  </span>
                )}
              </td>
              <td className="py-4 px-6">
                {new Date(submission.created_at).toLocaleString()}
              </td>
              {/* elapsed time */}
              <td>
                {submission.time_completed &&
                  getElapsedTime(
                    submission.time_completed,
                    submission.created_at
                  )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
