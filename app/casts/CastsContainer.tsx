"use client";

import { INeynarCastResponse } from "@/types/interfaces";
import React from "react";

interface IProps {
  casts: INeynarCastResponse[];
}

export default function CastsContainer({ casts }: IProps) {
  return (
    <div className="space-y-4 p-4">
      {casts.length > 0 ? (
        casts.map((cast) => <CastItem key={cast.hash} cast={cast} />)
      ) : (
        <div className="text-center text-gray-500">No casts available</div>
      )}
    </div>
  );
}

interface CastItemProps {
  cast: INeynarCastResponse;
}

function CastItem({ cast }: CastItemProps) {
  return (
    <div className="border rounded-lg shadow-md p-4 bg-white">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold">{cast.author.display_name}</h3>
          <p className="text-sm text-gray-500">@{cast.author.username}</p>
        </div>
      </div>
      <p className="mt-2">{cast.text}</p>
      <p className="mt-2 text-sm text-gray-500">
        <strong>Timestamp:</strong> {new Date(cast.timestamp).toLocaleString()}
      </p>
      {cast.embeds.length > 0 && (
        <div className="mt-2 space-y-2">
          {cast.embeds.map((embed, index) => (
            <img
              key={index}
              src={embed.url}
              alt="embed"
              className="w-full rounded-md"
            />
          ))}
        </div>
      )}
      <div className="mt-4">
        <h4 className="font-bold">Stats</h4>
        <div className="flex justify-between mt-2">
          <p>
            <strong>Likes:</strong> {cast.reactions.likes_count}
          </p>
          <p>
            <strong>Recasts:</strong> {cast.reactions.recasts_count}
          </p>
        </div>
        <div className="mt-2">
          <strong>Channel:</strong> {cast.channel.name}
        </div>
        <div className="mt-2">
          <strong>Profile Bio:</strong>{" "}
          {typeof cast.author.profile.bio === "string"
            ? cast.author.profile.bio
            : "N/A"}
        </div>
        <div className="mt-2">
          <strong>Follower Count:</strong> {cast.author.follower_count}
        </div>
        <div className="mt-2">
          <strong>Following Count:</strong> {cast.author.following_count}
        </div>
        <div className="mt-2">
          <strong>Active Status:</strong> {cast.author.active_status}
        </div>
      </div>
    </div>
  );
}
