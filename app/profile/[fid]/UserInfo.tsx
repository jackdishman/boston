import React from "react";
import { TextToParagraph } from "./TextToParagraph";

interface IUserInfoProps {
  displayName: string;
  username: string;
  fid: string;
  bio: string;
  followerCount: number;
  followingCount: number;
  jobTitle: string;
  location: string;
  channels: { type: string; isVerified: boolean; url: string }[];
}

const UserInfo: React.FC<IUserInfoProps> = ({
  displayName,
  username,
  fid,
  bio,
  followerCount,
  followingCount,
  jobTitle,
  location,
  channels,
}) => {
  return (
    <div className="sm:flex sm:justify-between w-full">
      <div className="my-5 sm:ml-5 w-full">
        <h1 className="text-3xl font-semibold text-center sm:text-left text-accent">
          {displayName}
        </h1>
        <p className="text-xl text-center sm:text-left text-gray-600">
          @{username} ({fid})
        </p>
        <div className="text-lg my-4 text-center sm:text-left text-gray-700">
          <TextToParagraph text={bio} />
        </div>

        {/* Stats and Personal Info */}
        <div className="mt-4 flex flex-col sm:flex-row justify-between items-start">
          <div className="text-gray-600 mb-4 flex sm:flex-col justify-around w-full">
            <p>Followers: {followerCount}</p>
            <p>Following: {followingCount}</p>
          </div>
          <div className="text-gray-800 mb-4 flex sm:flex-col justify-around w-full">
            <p className="font-medium">Job Title: {jobTitle}</p>
            <p className="font-medium">Location: {location}</p>
          </div>

          {/* Channels */}
          <div className="flex justify-around flex-wrap">
            {channels.map((channel, index) => (
              <a
                key={index}
                href={channel.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg font-semibold capitalize text-blue-600 hover:underline pb-2 pr-4"
              >
                {channel.type} {channel.isVerified && "✅"}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserInfo;
