"use client";

import React, { useState, useEffect } from "react";
import { INeynarUserResponse } from "@/types/interfaces";
import ImageCard from "../../components/ImageCard";
import Filter from "@/app/components/icons/Filter";

interface FollowersListProps {
  users: INeynarUserResponse[];
}

const truncateAddress = (address: string): string => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const FollowersList: React.FC<FollowersListProps> = ({ users }) => {
  const [sortOption, setSortOption] = useState<string>("dateJoinedDesc");
  const [sortedUsers, setSortedUsers] = useState<INeynarUserResponse[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);

  useEffect(() => {
    let sorted = [...users].sort((a, b) => {
      if (sortOption === "alphabeticalAsc") {
        return (a.display_name || "").localeCompare(b.display_name || "");
      }
      if (sortOption === "alphabeticalDesc") {
        return (b.display_name || "").localeCompare(a.display_name || "");
      }
      if (sortOption === "dateJoinedAsc") {
        return (
          new Date(a.followedAt).getTime() - new Date(b.followedAt).getTime()
        );
      }
      if (sortOption === "dateJoinedDesc") {
        return (
          new Date(b.followedAt).getTime() - new Date(a.followedAt).getTime()
        );
      }
      if (sortOption === "followersCountAsc") {
        return a.follower_count - b.follower_count;
      }
      if (sortOption === "followersCountDesc") {
        return b.follower_count - a.follower_count;
      }
      return 0;
    });

    if (sortOption === "dateJoinedDesc") {
      sorted = sorted.reverse();
    }

    if (searchQuery) {
      sorted = sorted.filter(
        (user) =>
          (user.username &&
            user.username.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (user.display_name &&
            user.display_name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setSortedUsers(sorted);
  }, [sortOption, users, searchQuery]);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      {/* Sidebar */}
      <div className="w-full lg:w-1/4 fixed lg:relative z-20 bg-white shadow-lg lg:shadow-none lg:block hidden">
        <div className="p-4 lg:sticky lg:top-20">
          <div className="mb-5">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Sort by:
            </label>
            <div className="flex flex-col space-y-2">
              <button
                onClick={() => setSortOption("dateJoinedDesc")}
                className={`px-4 py-2 rounded ${
                  sortOption === "dateJoinedDesc"
                    ? "bg-gray-200 border-2 border-blue-500"
                    : "bg-blue-500 text-white"
                }`}
              >
                Date Joined (Oldest First)
              </button>
              <button
                onClick={() => setSortOption("dateJoinedAsc")}
                className={`px-4 py-2 rounded ${
                  sortOption === "dateJoinedAsc"
                    ? "bg-gray-200 border-2 border-blue-500"
                    : "bg-blue-500 text-white"
                }`}
              >
                Date Joined (Newest First)
              </button>
              <button
                onClick={() => setSortOption("alphabeticalAsc")}
                className={`px-4 py-2 rounded ${
                  sortOption === "alphabeticalAsc"
                    ? "bg-gray-200 border-2 border-blue-500"
                    : "bg-blue-500 text-white"
                }`}
              >
                Alphabetical (A-Z)
              </button>
              <button
                onClick={() => setSortOption("alphabeticalDesc")}
                className={`px-4 py-2 rounded ${
                  sortOption === "alphabeticalDesc"
                    ? "bg-gray-200 border-2 border-blue-500"
                    : "bg-blue-500 text-white"
                }`}
              >
                Alphabetical (Z-A)
              </button>
              <button
                onClick={() => setSortOption("followersCountAsc")}
                className={`px-4 py-2 rounded ${
                  sortOption === "followersCountAsc"
                    ? "bg-gray-200 border-2 border-blue-500"
                    : "bg-blue-500 text-white"
                }`}
              >
                Followers Count (Ascending)
              </button>
              <button
                onClick={() => setSortOption("followersCountDesc")}
                className={`px-4 py-2 rounded ${
                  sortOption === "followersCountDesc"
                    ? "bg-gray-200 border-2 border-blue-500"
                    : "bg-blue-500 text-white"
                }`}
              >
                Followers Count (Descending)
              </button>
            </div>
          </div>
          <div className="mb-5">
            <input
              type="text"
              placeholder="Search by username or display name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full px-4 py-2 border border-gray-300 rounded text-xs focus:outline-none focus:ring focus:ring-blue-500"
            />
          </div>
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
        <div className="fixed inset-0 z-30 bg-white p-4 lg:hidden">
          <button
            onClick={() => setIsFilterOpen(false)}
            className="absolute top-4 right-4 text-gray-500 text-2xl"
          >
            ✖
          </button>
          <div className="mt-8">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Sort by:
            </label>
            <div className="flex flex-col space-y-2">
              <button
                onClick={() => setSortOption("dateJoinedDesc")}
                className={`px-4 py-2 rounded ${
                  sortOption === "dateJoinedDesc"
                    ? "bg-gray-200 border-2 border-blue-500"
                    : "bg-blue-500 text-white"
                }`}
              >
                Date Joined (Newest First)
              </button>
              <button
                onClick={() => setSortOption("dateJoinedAsc")}
                className={`px-4 py-2 rounded ${
                  sortOption === "dateJoinedAsc"
                    ? "bg-gray-200 border-2 border-blue-500"
                    : "bg-blue-500 text-white"
                }`}
              >
                Date Joined (Oldest First)
              </button>
              <button
                onClick={() => setSortOption("alphabeticalAsc")}
                className={`px-4 py-2 rounded ${
                  sortOption === "alphabeticalAsc"
                    ? "bg-gray-200 border-2 border-blue-500"
                    : "bg-blue-500 text-white"
                }`}
              >
                Alphabetical (A-Z)
              </button>
              <button
                onClick={() => setSortOption("alphabeticalDesc")}
                className={`px-4 py-2 rounded ${
                  sortOption === "alphabeticalDesc"
                    ? "bg-gray-200 border-2 border-blue-500"
                    : "bg-blue-500 text-white"
                }`}
              >
                Alphabetical (Z-A)
              </button>
              <button
                onClick={() => setSortOption("followersCountAsc")}
                className={`px-4 py-2 rounded ${
                  sortOption === "followersCountAsc"
                    ? "bg-gray-200 border-2 border-blue-500"
                    : "bg-blue-500 text-white"
                }`}
              >
                Followers Count (Ascending)
              </button>
              <button
                onClick={() => setSortOption("followersCountDesc")}
                className={`px-4 py-2 rounded ${
                  sortOption === "followersCountDesc"
                    ? "bg-gray-200 border-2 border-blue-500"
                    : "bg-blue-500 text-white"
                }`}
              >
                Followers Count (Descending)
              </button>
            </div>
            <div className="mt-5">
              <input
                type="text"
                placeholder="Search by username or display name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full px-4 py-2 border border-gray-300 rounded text-xs focus:outline-none focus:ring focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="w-full lg:w-3/4 lg:ml-auto lg:pl-4 pt-20 lg:pt-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-8 p-4">
          {sortedUsers.map((user) => (
            <div
              key={user.fid}
              className="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
            >
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
                <ul>
                  <li>
                    <a
                      href={`https://warpcast.com/${user.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Warpcast
                    </a>
                  </li>
                </ul>
                {user.verified_addresses.eth_addresses &&
                  user.verified_addresses.eth_addresses.map(
                    (address, index) => (
                      <div className="w-full" key={`${address}-${index}`}>
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
                    )
                  )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FollowersList;
