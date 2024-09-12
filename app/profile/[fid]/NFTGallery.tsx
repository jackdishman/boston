"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { INFTs, OwnedNft } from "@/types/interfaces";
import NFTCard from "@/app/components/NFTCard";

interface IProps {
  nfts: INFTs[];
  activeAddress: string;
  activeNetwork: string;
}

const NFTGallery: React.FC<IProps> = (props: IProps) => {
  const { nfts, activeAddress, activeNetwork } = props;
  const [filteredNfts, setFilteredNfts] = React.useState<OwnedNft[]>([]);

  //   get all nfts from all addresses
  const allNfts: OwnedNft[] = nfts.flatMap((nft) => [
    ...nft.ethereumNFTs,
    ...nft.baseNFTs,
  ]);

  function filterByAddress(address: string) {
    const filtered = nfts.find((nft) => nft.address === address);
    return filtered;
  }

  useEffect(() => {
    // show all nfts
    if (activeAddress === "all" && activeNetwork === "all") {
      setFilteredNfts(allNfts);
      return;
    }

    if (activeAddress !== "all") {
      // filter by address
      const filteredByAddress = filterByAddress(activeAddress);
      if (filteredByAddress) {
        if (activeNetwork !== "all") {
          // filter by both network and address
          const filteredByBoth =
            activeNetwork === "base"
              ? filteredByAddress.baseNFTs
              : filteredByAddress.ethereumNFTs;
          setFilteredNfts(filteredByBoth || []);
        } else {
          // only filter by address
          const allByOwner = [
            ...(filteredByAddress?.baseNFTs ?? []),
            ...(filteredByAddress?.ethereumNFTs ?? []),
          ];
          setFilteredNfts(allByOwner);
        }
      } else {
        setFilteredNfts([]);
      }
      return;
    }

    // filter by network only
    if (activeNetwork !== "all") {
      const filteredByNetwork =
        activeNetwork === "base"
          ? nfts.flatMap((nft) => nft.baseNFTs)
          : nfts.flatMap((nft) => nft.ethereumNFTs);
      setFilteredNfts(filteredByNetwork);
      return;
    }
  }, [activeAddress, activeNetwork]);

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">NFT Gallery</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        {/* display nfts */}
        {filteredNfts.map((nft, index) => (
          <NFTCard key={index} nft={nft} />
        ))}
      </div>
    </div>
  );
};

export default NFTGallery;
