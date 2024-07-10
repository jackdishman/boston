"use client";

import React, { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import { IChannelResponse } from "@/types/interfaces";
import Link from "next/link";

interface IChannelListProps {
  channels: IChannelResponse[];
}

const ChannelList = (props: IChannelListProps) => {
  const { channels } = props;
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  const filteredChannels = useMemo(() => {
    if (debouncedSearchTerm === "") {
      return channels
        .sort((a, b) => b.followerCount - a.followerCount)
        .slice(0, 10);
    }

    const term = debouncedSearchTerm.toLowerCase();
    const nameMatches = channels.filter((channel) =>
      channel.name.toLowerCase().includes(term)
    );

    const descriptionMatches = channels.filter(
      (channel) =>
        !channel.name.toLowerCase().includes(term) &&
        channel.description.toLowerCase().includes(term)
    );

    return [...nameMatches, ...descriptionMatches];
  }, [channels, debouncedSearchTerm]);

  return (
    <div className="w-full px-4">
      <div className="flex justify-center mt-8">
        <input
          type="text"
          placeholder="Search channels"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-96 p-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {filteredChannels.map((channel) => (
          <Link href={`/channel/${channel.id}`} key={channel.id}>
            <div
              key={channel.id}
              className="border border-gray-200 rounded-lg shadow-sm p-4 bg-white hover:shadow-md transition-shadow duration-200"
            >
              <img
                src={channel.imageUrl}
                alt={`${channel.name} cover`}
                className="w-full h-32 object-cover rounded-md mb-4"
              />
              <h2 className="text-xl font-semibold mb-2">{channel.name}</h2>
              <p className="text-gray-700 mb-2">{channel.description}</p>
              <p className="text-gray-600 mt-2">
                Follower Count: {channel.followerCount}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

ChannelList.propTypes = {
  channels: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      url: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string,
      imageUrl: PropTypes.string,
      leadFid: PropTypes.number,
      hostFids: PropTypes.arrayOf(PropTypes.number),
      createdAt: PropTypes.number,
      followerCount: PropTypes.number,
    })
  ).isRequired,
};

export default ChannelList;
