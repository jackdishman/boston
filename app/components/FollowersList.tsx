"use client";

import React, { useState, useEffect } from "react";
import { INeynarUserResponse } from "@/types/interfaces";
import ImageCard from "./ImageCard";

interface FollowersListProps {
  users: INeynarUserResponse[];
}

const truncateAddress = (address: string): string => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const FollowersList: React.FC<FollowersListProps> = ({ users }) => {
  const [sortOption, setSortOption] = useState<string>("dateJoined");
  const [sortedUsers, setSortedUsers] = useState<INeynarUserResponse[]>([]);

  useEffect(() => {
    const sorted = [...users].sort((a, b) => {
      if (sortOption === "alphabetical") {
        return a.display_name.localeCompare(b.display_name);
      }
      if (sortOption === "dateJoined") {
        return (
          new Date(a.followedAt).getTime() - new Date(b.followedAt).getTime()
        );
      }
      return 0;
    });

    if (sortOption === "dateJoined") {
      sorted.reverse(); // Show earliest joiners first
    }

    setSortedUsers(sorted);
  }, [sortOption, users]);

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="mb-5">
        <button
          onClick={() => setSortOption("dateJoined")}
          className={`px-4 py-2 mr-2 ${
            sortOption === "dateJoined"
              ? "bg-blue-500 text-white"
              : "bg-gray-200"
          }`}
        >
          Date Joined
        </button>
        <button
          onClick={() => setSortOption("alphabetical")}
          className={`px-4 py-2 ${
            sortOption === "alphabetical"
              ? "bg-blue-500 text-white"
              : "bg-gray-200"
          }`}
        >
          Alphabetical
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {sortedUsers.map((user) => (
          <div key={user.fid} className="">
            <div className="h-64">
              <ImageCard
                imageUrl={user.pfp_url}
                linkUrl={`https://warpcast.com/${user.username}`}
              />
            </div>
            <div className="p-4">
              <h3 className="text-xl font-bold">{user.display_name}</h3>
              <p>{user.profile.bio.text}</p>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-500 mb-1">
                <span className="font-medium">Followers:</span>{" "}
                {user.follower_count}
              </p>
              <p className="text-sm text-gray-500 mb-1">
                <span className="font-medium">Following:</span>{" "}
                {user.following_count}
              </p>
              <p className="text-sm text-gray-500 mb-1">
                <span className="font-medium">Verified addresses:</span>{" "}
                {user.verified_addresses.eth_addresses.map((address) => (
                  <span key={address} className="inline-block mr-2">
                    <a
                      href={`https://etherscan.io/address/${address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      {truncateAddress(address)}
                    </a>{" "}
                    |{" "}
                    <a
                      href={`https://basescan.org/address/${address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      BaseScan
                    </a>{" "}
                    |{" "}
                    <a
                      href={`https://opensea.io/${address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      OpenSea
                    </a>
                  </span>
                ))}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FollowersList;
