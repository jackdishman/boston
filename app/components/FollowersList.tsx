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
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    let sorted = [...users].sort((a, b) => {
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
      sorted = sorted.reverse(); // Show earliest joiners first
    }

    if (searchQuery) {
      sorted = sorted.filter(
        (user) =>
          user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.display_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setSortedUsers(sorted);
  }, [sortOption, users, searchQuery]);

  return (
    <div className="flex flex-col items-center justify-center">
      {/* top header */}
      <div className="flex justify-center w-full fixed top-20 right-0 z-20">
        <div className="flex justify-between w-full max-w-7xl items-center pt-2">
          <div className="flex">
            {/* filters */}
            <div className="mb-5">
              <button
                onClick={() => setSortOption("dateJoined")}
                className={`px-4 py-2 mr-2 rounded ${
                  sortOption === "dateJoined"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 border border-blue-500"
                }`}
              >
                Date Joined
              </button>
              <button
                onClick={() => setSortOption("alphabetical")}
                className={`px-4 py-2 rounded ${
                  sortOption === "alphabetical"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 border border-blue-500"
                }`}
              >
                Alphabetical
              </button>
            </div>
          </div>

          <div className="mb-5">
            <input
              type="text"
              placeholder="Search by username or display name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded w-full sm:w-64 lg:w-72 text-xs focus:outline-none focus:ring focus:ring-blue-500 ring-blue-200"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 pt-20">
        {sortedUsers.map((user) => (
          <div key={user.fid} className="bg-gray-200">
            <div className="h-64">
              <ImageCard
                imageUrl={user.pfp_url}
                linkUrl={`https://warpcast.com/${user.username}`}
              />
            </div>
            <div className="px-4 pt-4">
              <h3 className="text-xl font-bold break-words">
                {user.display_name}
              </h3>
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
              {user.verified_addresses.eth_addresses &&
                user.verified_addresses.eth_addresses.map((address) => (
                  <div className="w-full" key={address}>
                    <p className="font-medium my-2">
                      Verified addresses: {truncateAddress(address)}
                    </p>
                    <ul className="list-inside list-disc">
                      <li>
                        <a
                          href={`https://etherscan.io/address/${address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          Etherscan
                        </a>
                      </li>
                      <li>
                        <a
                          href={`https://basescan.org/address/${address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          BaseScan
                        </a>
                      </li>
                      <li>
                        <a
                          href={`https://opensea.io/${address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          OpenSea
                        </a>
                      </li>
                    </ul>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FollowersList;
