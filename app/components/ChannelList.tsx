// components/ChannelList.tsx
"use client";

import React, { useMemo } from "react";
import { IChannelResponse } from "@/types/interfaces";
import { useRouter } from "next/navigation";

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

  const filteredChannels = useMemo(() => {
    if (searchTerm === "") {
      return channels
        .sort((a, b) => b.followerCount - a.followerCount)
        .slice(0, 10);
    }

    const term = searchTerm.toLowerCase();
    const nameMatches = channels.filter((channel) =>
      channel.name.toLowerCase().includes(term)
    );

    const descriptionMatches = channels.filter(
      (channel) =>
        !channel.name.toLowerCase().includes(term) &&
        channel.description.toLowerCase().includes(term)
    );

    return [...nameMatches, ...descriptionMatches];
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
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3 mt-8">
        {filteredChannels.map((channel) => (
          <div
            key={channel.id}
            onClick={() => handleChannelClick(channel.id)}
            className="cursor-pointer border border-gray-200 rounded-lg shadow-sm p-4 bg-white hover:shadow-md transition-shadow duration-200"
          >
            {/* <img
              src={channel.imageUrl}
              alt={`${channel.name} cover`}
              className="w-full h-32 object-cover rounded-md mb-4"
            /> */}
            <h2 className="text-xl font-semibold mb-2">{channel.name}</h2>
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
