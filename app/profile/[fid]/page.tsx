import { getIcebreakerProfile, getUsersByFids } from "@/middleware/helpers";
import {
  getAllBalances,
  getDishTokenBalance,
  getNFTs,
} from "@/middleware/alchemy";
import React from "react";
import ClientContainer from "./ClientContainer";
import { IAddressBalance, INFTs } from "@/types/interfaces";
import {
  getProfileOpenRankByEngagement,
  getProfileOpenRankByFollowing,
} from "@/middleware/openrank";
import { Metadata, ResolvingMetadata } from "next";
import { Suspense } from 'react'
import Skeleton from "@/app/components/Skeleton";

type Props = {
  params: { fid: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const fid = params.fid;
  const user = await getUsersByFids([fid]);
  const p = user[0];
  if (!user) {
    return {
      title: "Profile not found",
      openGraph: {
        title: "Profile not found",
        description: "Profile not found",
      },
      metadataBase: new URL(process.env["NEXT_PUBLIC_HOST"] || ""),
    };
  }
  const imageUrl = p.pfp_url || `${process.env["NEXT_PUBLIC_HOST"]}/fc-og.png`;
  const fcMetadata: Record<string, string> = {
    "fc:frame": "vNext",
    "fc:frame:image": imageUrl,
    "fc:frame:button:1": `View in App`,
    "fc:frame:button:1:action": `link`,
    "fc:frame:button:1:target": `${process.env["NEXT_PUBLIC_HOST"]}/profile/${p.fid}`,
  };

  return {
    title: p.username,
    openGraph: {
      title: p.username ?? `Profile ${p.fid}`,
      description: `View the profile of ${p.username}`,
      images: [{ url: imageUrl }],
    },
    other: {
      ...fcMetadata,
    },
    metadataBase: new URL(process.env["NEXT_PUBLIC_HOST"] || ""),
  };
}

export default async function Page({ params }: { params: { fid: string } }) {
  const { fid } = params;

  // Fetch user by fid
  const user = await getUsersByFids([fid]);
  const p = user[0];
  const icebreakerRes = await getIcebreakerProfile(fid);
  const icebreakerProfile = icebreakerRes?.profiles[0];

  // Fetch dish balance for all verified Ethereum addresses and sum them
  const dishBalances = await Promise.all(
    p.verified_addresses.eth_addresses.map(async (address) => {
      const balance = await getDishTokenBalance(address);
      return balance ?? 0;
    })
  );
  const totalDishBalance = dishBalances.reduce(
    (acc, balance) => acc + balance,
    0
  );

  // Fetch token balances for Ethereum and Base
  const addressBalances: IAddressBalance[] = await Promise.all(
    p.verified_addresses.eth_addresses.map(async (address) => {
      const baseBalances = await getAllBalances(address, "base");
      const ethereumBalances = await getAllBalances(address, "ethereum");
      return {
        address,
        balances: [...baseBalances, ...ethereumBalances],
      };
    })
  );

  // Fetch NFTs for all verified Ethereum addresses
  const nfts: INFTs[] = await Promise.all(
    p.verified_addresses.eth_addresses.map(async (address) => {
      const nftsForAddressEthereum = await getNFTs(address, 100, "ethereum");
      const nftsForAddressBase = await getNFTs(address, 100, "base");
      return {
        address,
        ethereumNFTs: nftsForAddressEthereum
          ? nftsForAddressEthereum.ownedNfts
          : [],
        baseNFTs: nftsForAddressBase ? nftsForAddressBase.ownedNfts : [],
      };
    })
  );

  const profileRankRes = await Promise.all([
    getProfileOpenRankByFollowing([Number(params.fid)]),
    getProfileOpenRankByEngagement([Number(params.fid)]),
  ]);
  const followingRank = profileRankRes[0] ? profileRankRes[0] : [];
  const engagementRank = profileRankRes[1] ? profileRankRes[1] : [];
  return (
    <div
      className={`p-4 max-w-6xl mx-auto bg-white shadow-lg rounded-lg ${
        totalDishBalance > 0 && "bg-gradient-to-r from-yellow-200 to-yellow-100"
      }`}
    >
      <Suspense fallback={<Skeleton />}>
        <ClientContainer
          user={p}
          icebreakerProfile={icebreakerProfile}
          addressBalances={addressBalances}
          nfts={nfts}
          followingRank={followingRank[0]}
          engagementRank={engagementRank[0]}
          dishTokenBalance={totalDishBalance ?? 0}
        />
      </Suspense>
    </div>
  );
}
