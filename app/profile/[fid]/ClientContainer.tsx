"use client";

import React, { useState } from "react";
import TokenBalances from "./TokenBalances";
import UserInfo from "./UserInfo";
import Credentials from "./Credentials";
import Highlights from "./Highlights";
import WorkExperience from "./WorkExperience";
import NFTGallery from "./NFTGallery";
import Image from "next/image";
import {
  IAddressBalance,
  IIcebreakerProfile,
  INeynarUserResponse,
  INFTs,
} from "@/types/interfaces";
import { IOpenRankProfileResponse } from "@/middleware/openrank";
import OpenRankData from "./OpenRankData";
import ShareButton from "./ShareButton";
import ChannelMemberships from "./ChannelMemberships";
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid';

interface ClientContainerProps {
  user: INeynarUserResponse;
  icebreakerProfile?: IIcebreakerProfile;
  addressBalances: IAddressBalance[];
  nfts: INFTs[];
  followingRank: IOpenRankProfileResponse;
  engagementRank: IOpenRankProfileResponse;
  dishTokenBalance: number;
}

const ClientContainer: React.FC<ClientContainerProps> = ({
  user,
  icebreakerProfile,
  addressBalances,
  nfts,
  followingRank,
  engagementRank,
  dishTokenBalance,
}) => {
  const [selectedNetwork, setSelectedNetwork] = useState<
    "ethereum" | "base" | "all"
  >("all");
  const [selectedAddress, setSelectedAddress] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"coins" | "nft">("coins");
  const [isChannelMembershipsExpanded, setIsChannelMembershipsExpanded] = useState(false);
  const [isTokenBalancesExpanded, setIsTokenBalancesExpanded] = useState(false);

  return (
    <div>
      <div className="sm:flex sm:space-x-8 items-center">
        {/* Profile Picture */}
        <div className="flex justify-center sm:w-1/3">
          <Image
            width={256}
            height={256}
            src={user.pfp_url}
            alt="avatar"
            className="w-40 h-40 sm:w-64 sm:h-64 rounded object-cover shadow-md ring-4 ring-accent"
          />
        </div>

        {/* User Info */}
        <UserInfo
          displayName={user.display_name}
          username={user.username}
          fid={user.fid.toString()}
          bio={user.profile.bio.text}
          followerCount={user.follower_count}
          followingCount={user.following_count}
          jobTitle={icebreakerProfile?.jobTitle || "N/A"}
          location={icebreakerProfile?.location || "N/A"}
          channels={icebreakerProfile?.channels || []}
        />
      </div>

      {/* Dish Token Balance */}
      {dishTokenBalance > 0 && <p>Dish token balance: {dishTokenBalance}</p>}

      {/* Share Button */}
      <ShareButton user={user} />

      {/* Section Spacing */}
      <div className="mt-8 space-8 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4">
        {/* Credentials */}
        <Credentials credentials={icebreakerProfile?.credentials || []} />

        {/* Highlights */}
        <Highlights highlights={icebreakerProfile?.highlights || []} />

        {/* Work Experience */}
        <WorkExperience
          workExperience={icebreakerProfile?.workExperience || []}
        />

        {/* ProfileRank data */}
        <OpenRankData
          followingRank={followingRank}
          engagementRank={engagementRank}
        />

      </div>

      {/* Channel Memberships */}
      <div className="w-full mt-8">
        <button
          onClick={() => setIsChannelMembershipsExpanded(!isChannelMembershipsExpanded)}
          className="flex items-center justify-between w-full px-4 py-2 bg-gray-100 rounded-lg"
        >
          <span className="text-lg font-bold">Channel Memberships</span>
          {isChannelMembershipsExpanded ? (
            <ChevronUpIcon className="w-5 h-5" />
          ) : (
            <ChevronDownIcon className="w-5 h-5" />
          )}
        </button>
        {isChannelMembershipsExpanded && (
          <div className="mt-4">
            <ChannelMemberships fid={user.fid} />
          </div>
        )}
      </div>

      {/* Token Balances / NFTs Section */}
      <div className="mt-8">
        <button
          onClick={() => setIsTokenBalancesExpanded(!isTokenBalancesExpanded)}
          className="flex items-center justify-between w-full px-4 py-2 bg-gray-100 rounded-lg"
        >
          <span className="text-lg font-bold">Token Balances & NFTs</span>
          {isTokenBalancesExpanded ? (
            <ChevronUpIcon className="w-5 h-5" />
          ) : (
            <ChevronDownIcon className="w-5 h-5" />
          )}
        </button>
        {isTokenBalancesExpanded && (
          <>
            {/* Network and Address Filter */}
            <div className="mt-4">
              <h3 className="text-lg font-bold">Filter by Network & Address:</h3>
              <div className="flex space-x-4 mt-2">
                <button
                  onClick={() => setSelectedNetwork("all")}
                  className={`px-4 py-2 rounded ${
                    selectedNetwork === "all"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200"
                  }`}
                >
                  All Networks
                </button>
                <button
                  onClick={() => setSelectedNetwork("ethereum")}
                  className={`px-4 py-2 rounded ${
                    selectedNetwork === "ethereum"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200"
                  }`}
                >
                  Ethereum
                </button>
                <button
                  onClick={() => setSelectedNetwork("base")}
                  className={`px-4 py-2 rounded ${
                    selectedNetwork === "base"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200"
                  }`}
                >
                  Base
                </button>
              </div>

              {/* Address Filter */}
              <div className="flex flex-col sm:flex-row items-center mt-4">
                <label className="text-xl font-semibold mr-4">
                  Verified ETH Addresses:
                </label>
                <select
                  value={selectedAddress}
                  onChange={(e) => setSelectedAddress(e.target.value)}
                  className="px-4 py-2 border rounded w-64"
                >
                  <option value="all">All Addresses</option>
                  {addressBalances.map(({ address }) => (
                    <option key={address} value={address}>
                      {address}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tab Buttons */}
            <div className="mt-4">
              <button
                onClick={() => setActiveTab("coins")}
                className={`px-4 py-2 rounded ${
                  activeTab === "coins" ? "bg-blue-500 text-white" : "bg-gray-200"
                }`}
              >
                Token Balances
              </button>
              <button
                onClick={() => setActiveTab("nft")}
                className={`px-4 py-2 rounded ${
                  activeTab === "nft" ? "bg-blue-500 text-white" : "bg-gray-200"
                }`}
              >
                NFTs
              </button>
            </div>

            {activeTab === "coins" ? (
              <TokenBalances
                addressBalances={addressBalances}
                activeAddress={selectedAddress}
                activeNetwork={selectedNetwork}
              />
            ) : (
              <NFTGallery
                nfts={nfts}
                activeAddress={selectedAddress}
                activeNetwork={selectedNetwork}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ClientContainer;
