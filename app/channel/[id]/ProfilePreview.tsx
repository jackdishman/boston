import React from "react";
import Link from "next/link";
import Image from "next/image";
import { INeynarUserResponse } from "@/types/interfaces";

interface ProfilePreviewProps {
  user: INeynarUserResponse;
}

const formatNumber = (num: number): string => {
  return num.toLocaleString();
};

const ProfilePreview: React.FC<ProfilePreviewProps> = ({ user }) => (
  <Link 
    href={`/profile/${user.fid}`}
    className="block w-full sm:w-64 bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:bg-gray-50 mx-auto"
  >
    <div className="relative h-48">
      <Image
        src={user.pfp_url}
        alt={user.username}
        className="w-full h-full object-cover"
        width={256}
        height={256}
      />
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
        <h3 className="text-xl font-bold text-white break-words">{user.display_name}</h3>
        <p className="text-sm text-gray-300">
          @{user.username} <span className="ml-2 text-gray-400">({user.fid})</span>
        </p>
      </div>
    </div>
    <div className="p-4">
      <p className="text-sm text-gray-600 mb-4 h-20 overflow-hidden">{user.profile.bio.text}</p>
      <div className="flex justify-between mb-4">
        <div className="text-center">
          <p className="text-lg font-semibold">{formatNumber(user.follower_count)}</p>
          <p className="text-xs text-gray-500">Followers</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold">{formatNumber(user.following_count)}</p>
          <p className="text-xs text-gray-500">Following</p>
        </div>
      </div>
    </div>
  </Link>
);

export default ProfilePreview;
