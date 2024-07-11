"use client";

import Filter from "@/app/components/icons/Filter";
import { INeynarCastResponse } from "@/types/interfaces";
import React, { useState, useEffect } from "react";

interface IProps {
  casts: INeynarCastResponse[];
}

export default function CastsContainer({ casts }: IProps) {
  const [sortOption, setSortOption] = useState<string>("dateJoinedDesc");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [topCasters, setTopCasters] = useState<
    { username: string; displayName: string; score: number }[]
  >([]);

  useEffect(() => {
    calculateTopCasters();
  }, [casts]);

  const calculateTopCasters = () => {
    const casterScores: {
      [key: string]: { displayName: string; score: number };
    } = {};

    casts.forEach((cast) => {
      const score =
        cast.reactions.likes_count + cast.reactions.recasts_count * 2;
      const username = cast.author.username;
      const displayName = cast.author.display_name;

      if (casterScores[username]) {
        casterScores[username].score += score;
      } else {
        casterScores[username] = { displayName, score };
      }
    });

    const sortedCasters = Object.entries(casterScores)
      .map(([username, { displayName, score }]) => ({
        username,
        displayName,
        score,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    setTopCasters(sortedCasters);
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-full lg:w-1/4 fixed lg:relative z-20 bg-white shadow-lg lg:shadow-none lg:block hidden">
        <div className="p-4 lg:sticky lg:top-20">
          <div className="mb-5">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Top Casters:
            </label>
            <div className="flex flex-col space-y-2">
              {topCasters.map((caster, index) => (
                <div key={index} className="flex justify-between">
                  <span>{caster.displayName}</span>
                  <span>{caster.score}</span>
                </div>
              ))}
            </div>
          </div>
          <p>Likes Count ＋ 2 𝚡 Recasts = Score</p>
        </div>
      </div>

      {/* Mobile Filter Button */}
      <button
        onClick={() => setIsFilterOpen(!isFilterOpen)}
        className="fixed bottom-4 left-4 bg-blue-500 text-white p-2 rounded-full z-40 lg:hidden"
      >
        <Filter />
      </button>

      {/* Mobile Filter Panel */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-30 bg-white p-4 mt-20 lg:hidden">
          <button
            onClick={() => setIsFilterOpen(false)}
            className="absolute top-4 right-4 text-gray-500 text-2xl"
          >
            ✖
          </button>
          <div className="mt-8">
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Top Casters:
              </label>
              <div className="flex flex-col space-y-2">
                {topCasters.map((caster, index) => (
                  <div key={index} className="flex justify-between">
                    <span>{caster.displayName}</span>
                    <span>{caster.score}</span>
                  </div>
                ))}
              </div>
            </div>
            <p>Likes Count ＋ 2 𝚡 Recasts = Score</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="w-full lg:w-3/4 lg:ml-auto lg:pl-4 pt-20 lg:pt-0 space-y-4 p-4">
        {casts.length > 0 ? (
          casts.map((cast) => <CastItem key={cast.hash} cast={cast} />)
        ) : (
          <div className="text-center text-gray-500">No casts available</div>
        )}
      </div>
    </div>
  );
}

interface CastItemProps {
  cast: INeynarCastResponse;
}

function CastItem({ cast }: CastItemProps) {
  return (
    <div className="border rounded-lg shadow-md p-6 bg-white overflow-hidden">
      <div className="flex items-center space-x-4">
        <img
          src={cast.author.pfp_url}
          alt="avatar"
          className="w-12 h-12 rounded-full"
        />
        <div>
          <h3 className="text-lg font-bold">{cast.author.display_name}</h3>
          <p className="text-sm text-gray-500">@{cast.author.username}</p>
        </div>
      </div>
      <p className="mt-4 text-lg">{cast.text}</p>
      <p className="mt-2 text-sm text-gray-500">
        <strong>Timestamp:</strong> {new Date(cast.timestamp).toLocaleString()}
      </p>
      {cast.embeds.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-4">
          {cast.embeds.map((embed, index) => (
            <img
              key={index}
              src={embed.url}
              alt="embed"
              className="w-full h-auto rounded-md"
            />
          ))}
        </div>
      )}
      <div className="mt-4 border-t pt-4">
        <h4 className="font-semibold text-lg">Stats</h4>
        <div className="flex items-center space-x-4 mt-2">
          <span className="flex items-center">
            <span className="font-semibold">
              ❤️ {cast.reactions.likes_count}
            </span>
          </span>
          <span className="flex items-center">
            <span className="font-semibold">
              🔁 {cast.reactions.recasts_count}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
