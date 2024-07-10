import React from "react";
import ChannelNav from "./ChannelNav";
import { IChannelResponse, INeynarUserResponse } from "@/types/interfaces";

interface ChannelLayoutProps {
  channel: IChannelResponse;
  leadMember: INeynarUserResponse;
  hosts: INeynarUserResponse[];
  children: React.ReactNode;
}

const ChannelLayout: React.FC<ChannelLayoutProps> = ({
  channel,
  leadMember,
  hosts,
  children,
}) => {
  const MemberPreview = (member: INeynarUserResponse) => (
    <a
      href={`https://warpcast.com/${member.username}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center p-2 border border-gray-200 rounded-lg mb-2 hover:bg-gray-50 transition"
    >
      <img
        src={member.pfp_url}
        alt={member.username}
        className="w-12 h-12 rounded-full"
      />
      <div className="ml-4">
        <p className="text-lg font-semibold text-gray-800">
          {member.display_name}
        </p>
        <p className="text-sm text-gray-600">@{member.username}</p>
        <p className="text-sm text-gray-500">FID: {member.fid}</p>
      </div>
    </a>
  );

  return (
    <section className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-10">
      <article className="bg-white rounded-lg shadow-lg text-center p-6 sm:p-8 w-full max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          {channel.name}
        </h1>
        <div className="flex flex-col sm:flex-row items-center mb-6">
          <img
            src={channel.imageUrl}
            alt={channel.description}
            className="w-32 h-32 rounded mb-4 sm:mb-0 sm:mr-4"
          />
          <div className="text-left">
            <p className="text-lg text-gray-700 mb-2">{channel.description}</p>
            <p className="text-gray-600">Followers: {channel.followerCount}</p>
            <p className="text-gray-600">
              Created on{" "}
              {new Date(channel.createdAt * 1000).toLocaleDateString()}
            </p>
          </div>
        </div>
        <ChannelNav />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          <div>
            <p className="text-lg font-semibold text-gray-700 mb-2">Lead:</p>
            <MemberPreview {...leadMember} />
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-700 mb-2">Hosts:</p>
            {hosts.map((h) => (
              <MemberPreview key={h.fid} {...h} />
            ))}
          </div>
        </div>
        <a
          className="text-blue-600 mt-6 inline-block font-semibold"
          href={channel.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          View Channel on Warpcast
        </a>
      </article>
      <div className="w-full mt-8">{children}</div>
    </section>
  );
};

export default ChannelLayout;
