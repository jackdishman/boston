import { getIcebreakerProfile, getUsersByFids } from "@/middleware/helpers";
import React from "react";
import { getAllBalances, IBalanceResponse } from "@/middleware/alchemy";
import TokenBalances from "./TokenBalances";
import UserInfo from "./UserInfo";
import Credentials from "./Credentials";
import Highlights from "./Highlights";
import WorkExperience from "./WorkExperience";
import Image from "next/image";

interface IAddressBalance {
  address: string;
  balances: IBalanceResponse;
}

export default async function Page({ params }: { params: { fid: string } }) {
  const { fid } = params;

  // Fetch user by fid
  const user = await getUsersByFids([fid]);
  const p = user[0];
  const icebreakerRes = await getIcebreakerProfile(fid);
  const icebreakerProfile = icebreakerRes?.profiles[0];

  const addressBalances: IAddressBalance[] = await Promise.all(
    p.verified_addresses.eth_addresses.map(async (address) => {
      const balances = await getAllBalances(address, "base");
      const ethereumBalances = await getAllBalances(address, "ethereum");

      return {
        address,
        balances: [...balances, ...ethereumBalances],
      };
    })
  );

  return (
    <div className="p-4 max-w-6xl mx-auto bg-white shadow-lg rounded-lg">
      <div className="sm:flex sm:space-x-8 items-center">
        {/* Profile Picture */}
        <div className="flex justify-center sm:w-1/3">
          <Image
            width={256}
            height={256}
            src={p.pfp_url}
            alt="avatar"
            className="w-40 h-40 sm:w-64 sm:h-64 rounded object-cover shadow-md ring-4 ring-accent"
          />
        </div>

        {/* User Info */}
        <UserInfo
          displayName={p.display_name}
          username={p.username}
          fid={p.fid.toString()}
          bio={p.profile.bio.text}
          followerCount={p.follower_count}
          followingCount={p.following_count}
          jobTitle={icebreakerProfile?.jobTitle || "N/A"}
          location={icebreakerProfile?.location || "N/A"}
          channels={icebreakerProfile?.channels || []}
        />
      </div>

      {/* Section Spacing */}
      <div className="mt-8 space-8 grid grid-cols-1 sm:grid-cols-3">
        {/* Credentials */}
        <Credentials credentials={icebreakerProfile?.credentials || []} />

        {/* Highlights */}
        <Highlights highlights={icebreakerProfile?.highlights || []} />

        {/* Work Experience */}
        <WorkExperience
          workExperience={icebreakerProfile?.workExperience || []}
        />
      </div>

      {/* Token Balances */}
      <TokenBalances addressBalances={addressBalances} />
    </div>
  );
}
