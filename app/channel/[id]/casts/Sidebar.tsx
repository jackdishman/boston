"use client";

import Link from "next/link";
import React from "react";

interface SidebarProps {
  withReplies: boolean;
  withRecasts: boolean;
  shouldModerate: boolean;
  setWithReplies: React.Dispatch<React.SetStateAction<boolean>>;
  setWithRecasts: React.Dispatch<React.SetStateAction<boolean>>;
  setShouldModerate: React.Dispatch<React.SetStateAction<boolean>>;
  topCasters: {
    username: string;
    displayName: string;
    score: number;
    fid: number;
  }[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  withReplies,
  withRecasts,
  shouldModerate,
  setWithReplies,
  setWithRecasts,
  setShouldModerate,
  topCasters,
}) => {
  return (
    <div className="w-full lg:w-1/4 fixed lg:relative z-20 bg-white shadow-lg lg:shadow-none lg:block hidden">
      <div className="p-4 lg:sticky lg:top-20">
        {/* Filters Section */}
        <div className="mb-5">
          <h3 className="block mb-2 text-sm font-medium text-gray-700">
            Filters
          </h3>
          <div className="flex flex-col space-y-2">
            <button
              onClick={() => setWithReplies(!withReplies)}
              className={`px-4 py-2 rounded ${
                withReplies ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
            >
              {withReplies ? "Hide Replies" : "Show Replies"}
            </button>
            <button
              onClick={() => setWithRecasts(!withRecasts)}
              className={`px-4 py-2 rounded ${
                withRecasts ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
            >
              {withRecasts ? "Hide Recasts" : "Show Recasts"}
            </button>
            <button
              onClick={() => setShouldModerate(!shouldModerate)}
              className={`px-4 py-2 rounded ${
                shouldModerate ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
            >
              {shouldModerate ? "Disable Moderation" : "Enable Moderation"}
            </button>
          </div>
        </div>

        {/* Top Casters Section */}
        <div className="mb-5">
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Top Casters:
          </label>
          <div className="flex flex-col space-y-2">
            {topCasters.map((caster, index) => (
              <div key={index} className="flex justify-between">
                <Link
                  href={`/profile/${caster.fid}`}
                  className="hover:underline text-sm"
                >
                  {caster.displayName} @{caster.username}
                </Link>
                <span>{caster.score}</span>
              </div>
            ))}
          </div>
        </div>
        <p>Likes Count ＋ 2 𝚡 Recasts = Score</p>
      </div>
    </div>
  );
};
