"use client";

import React from "react";
import Image from "next/image";
import ChannelNav from "./ChannelNav";
import ProfilePreview from "./ProfilePreview";
import { IChannelResponse, INeynarUserResponse } from "@/types/interfaces";

interface ChannelLayoutProps {
  channel: IChannelResponse;
  leadMember: INeynarUserResponse;
  children: React.ReactNode;
}

const ChannelLayout: React.FC<ChannelLayoutProps> = ({
  channel,
  leadMember,
  children,
}) => {
  return (
    <section className="min-h-screen flex flex-col items-center p-4 sm:p-10 bg-gray-100">
      <article className="bg-white rounded-lg shadow-lg p-6 sm:p-8 w-full">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-grow max-w-xl">
            <div className="mb-6">
              <Image
                src={channel.imageUrl}
                alt={channel.description}
                className="rounded-lg shadow-md h-auto"
                width={200}
                height={200}
                layout="responsive"
              />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              {channel.name}
            </h1>
            <p className="text-lg text-gray-700 mb-4">{channel.description}</p>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
              <p className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"></path>
                </svg>
                Followers: {channel.followerCount}
              </p>
              <p className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"></path>
                </svg>
                Created on {new Date(channel.createdAt * 1000).toLocaleDateString()}
              </p>
            </div>
            <a
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              href={channel.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"></path>
                <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"></path>
              </svg>
              View on Warpcast
            </a>
          </div>
          <div className="lg:border-l lg:pl-8 flex-shrink-0 lg:w-1/3">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Lead Member</h2>
            <ProfilePreview user={leadMember} />
          </div>
        </div>
        <div className="mt-8">
          <ChannelNav />
        </div>
      </article>
      <div className="w-full mt-8">{children}</div>
    </section>
  );
};

export default ChannelLayout;
