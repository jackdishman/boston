import { getIcebreakerProfile, getUsersByFids } from "@/middleware/helpers";
import {
  getAllBalances,
  getNFTs,
  IBalanceResponse,
} from "@/middleware/alchemy";
import React from "react";
import ClientContainer from "./ClientContainer";
import { IAddressBalance, INFTs } from "@/types/interfaces";

export default async function Page({ params }: { params: { fid: string } }) {
  const { fid } = params;

  // Fetch user by fid
  const user = await getUsersByFids([fid]);
  const p = user[0];
  const icebreakerRes = await getIcebreakerProfile(fid);
  const icebreakerProfile = icebreakerRes?.profiles[0];

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

  return (
    <div className="p-4 max-w-6xl mx-auto bg-white shadow-lg rounded-lg">
      <ClientContainer
        user={p}
        icebreakerProfile={icebreakerProfile}
        addressBalances={addressBalances}
        nfts={nfts}
      />
    </div>
  );
}
