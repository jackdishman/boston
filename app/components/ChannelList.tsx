"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  IChannelResponse,
  IChannelUsersResponse,
  INeynarUserResponse,
} from "@/types/interfaces";
import { useRouter } from "next/navigation";
import { getUsersByFids } from "@/middleware/helpers";
import Link from "next/link";

interface IChannelListProps {
  channels: IChannelResponse[];
  searchTerm: string;
  closeSearch: () => void;
}

const ChannelList: React.FC<IChannelListProps> = ({
  channels,
  searchTerm,
  closeSearch,
}) => {
  const router = useRouter();
  const [users, setUsers] = useState<INeynarUserResponse[]>([]);

  async function fetchUsers(input: string) {
    const uList: string[] = [input];
    const users = await getUsersByFids(uList);
    console.log(users);
    setUsers(users);
  }

  useEffect(() => {
    // if search only containes numbers, search by id
    if (/^\d+$/.test(searchTerm)) {
      fetchUsers(searchTerm);
    }
  }, [searchTerm]);

  const filteredChannels = useMemo(() => {
    if (searchTerm.length < 2) {
      return [];
    }

    const term = searchTerm.toLowerCase();
    const idMatches = channels.filter(
      (channel) => channel.id.toLowerCase() === term
    );

    const exactNameMatches = channels.filter(
      (channel) => channel.name.toLowerCase() === term
    );

    const nameMatches = channels.filter(
      (channel) =>
        channel.name.toLowerCase().includes(term) &&
        channel.name.toLowerCase() !== term
    );

    const descriptionMatches = channels.filter(
      (channel) =>
        !channel.name.toLowerCase().includes(term) &&
        channel.description.toLowerCase().includes(term)
    );

    // Combine all matches and remove duplicates
    const allMatches = [
      ...idMatches,
      ...exactNameMatches,
      ...nameMatches,
      ...descriptionMatches,
    ];

    const uniqueMatches = Array.from(
      new Set(allMatches.map((channel) => channel.id))
    ).map((id) => allMatches.find((channel) => channel.id === id)!);

    return uniqueMatches;
  }, [channels, searchTerm]);

  const handleChannelClick = (id: string) => {
    closeSearch();
    router.push(`/channel/${id}`);
  };

  return (
    <div className="fixed inset-0 z-40 bg-white bg-opacity-90 p-8 overflow-y-auto">
      <button
        onClick={closeSearch}
        className="absolute top-4 right-4 text-gray-500 text-2xl"
      >
        ✖
      </button>
      {/* loop through users and display them */}
      <div>
        <h2 className="text-lg mt-16">FIDs:</h2>

        {users.map((user) => (
          <div
            key={user.fid}
            className="cursor-pointer border border-gray-200 rounded-lg shadow-sm p-4 bg-white hover:shadow-md transition-shadow duration-200 w-96"
          >
            <a
              href={`https://warpcast.com/${user.username}`}
              target="_blank"
              className="text-xl font-semibold mb-2 flex items-center "
            >
              <img src={user.pfp_url} className="w-12 h-12 rounded-full" />
              <div className="ml-4">
                <h2 className="text-xl font-semibold mb-2">
                  {user.username} ({user.fid})
                </h2>
              </div>
            </a>
            <p></p>
          </div>
        ))}
      </div>
      <h2 className="text-lg mt-16">Channels:</h2>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3 mt-8">
        {filteredChannels.map((channel) => (
          <div
            key={channel.id}
            onClick={() => handleChannelClick(channel.id)}
            className="cursor-pointer border border-gray-200 rounded-lg shadow-sm p-4 bg-white hover:shadow-md transition-shadow duration-200"
          >
            <h2 className="text-xl font-semibold mb-2">
              {channel.name} (/{channel.id})
            </h2>
            <p className="text-gray-700 mb-2">{channel.description}</p>
            <p className="text-gray-600 mt-2">
              Follower Count: {channel.followerCount}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChannelList;
