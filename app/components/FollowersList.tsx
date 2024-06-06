// components/FollowersList.tsx

"use client";

import { INeynarUserResponse } from "@/types/interfaces";
import React from "react";

interface IProps {
  users: INeynarUserResponse[];
}

export default function FollowersList(props: IProps) {
  const { users } = props;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6">
      {users.map((user) => (
        <div
          key={user.fid}
          className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200"
        >
          <img
            src={user.pfp_url}
            alt={user.display_name}
            className="w-full h-48 object-cover"
          />
          <div className="p-4">
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              {user.display_name}
            </h1>
            <p className="text-gray-700 mb-4">{user.profile.bio.text}</p>
            <p className="text-sm text-gray-500 mb-1">
              <span className="font-medium">Active status:</span>{" "}
              {user.active_status}
            </p>
            <p className="text-sm text-gray-500 mb-1">
              <span className="font-medium">Followers:</span>{" "}
              {user.follower_count}
            </p>
            <p className="text-sm text-gray-500 mb-1">
              <span className="font-medium">Following:</span>{" "}
              {user.following_count}
            </p>
            <p className="text-sm text-gray-500 mb-1">
              <span className="font-medium">Verified:</span>{" "}
              {user.verifications.join(", ")}
            </p>
            <p className="text-sm text-gray-500 mb-1">
              <span className="font-medium">Verified addresses:</span>{" "}
              {user.verified_addresses.eth_addresses.join(", ")}
            </p>
            <p className="text-sm text-gray-500">
              <span className="font-medium">Power badge:</span>{" "}
              {user.power_badge ? "true" : "false"}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
