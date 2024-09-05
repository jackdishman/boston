"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { INFTs, OwnedNft } from "@/types/interfaces";

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
      if (activeNetwork !== "all") {
        // filter by both network and address
        const filteredByBoth =
          activeAddress === "base"
            ? filteredByAddress?.baseNFTs
            : filteredByAddress?.ethereumNFTs;
        setFilteredNfts(filteredByBoth || []);
        return;
      }
      // only filter by address
      const allByOwner = [
        ...(filteredByAddress?.baseNFTs ?? []),
        ...(filteredByAddress?.ethereumNFTs ?? []),
      ];
      setFilteredNfts(allByOwner);
      return;
    }
    // filter by network
    if (activeNetwork !== "all") {
      let filtered: INFTs[] = [];
      if (activeAddress !== "all") {
        // handle this logic
      }
      const allBaseNfts = nfts.flatMap((nft) => nft.baseNFTs);
      const allEthereumNfts = nfts.flatMap((nft) => nft.ethereumNFTs);
      if (activeNetwork === "base") {
        setFilteredNfts(allBaseNfts);
        return;
      }
      setFilteredNfts(allEthereumNfts);
    }
  }, [activeAddress, activeNetwork]);

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">NFT Gallery</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {/* display nfts */}
        {filteredNfts.map((nft, index) => (
          <div key={index} className="bg-white shadow-lg rounded-lg p-4">
            <div className="flex justify-between items-center">
              <h4 className="text-lg font-medium">{nft.metadata.name}</h4>
              <p className="text-gray-700">{nft.metadata.description}</p>
            </div>
            <div className="mt-4">
              {nft.metadata.image_url && (
                <Image
                  src={nft.metadata.image_url ?? "/nft-placeholder.png"}
                  alt={nft.metadata.name ?? "NFT Image"}
                  width={200}
                  height={200}
                  className="rounded-lg"
                  unoptimized={true}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NFTGallery;
