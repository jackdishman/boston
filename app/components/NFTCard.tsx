"use client";
import { OwnedNft } from "@/types/interfaces";
import React, { useState } from "react";
import Image from "next/image";

interface IProps {
  nft: OwnedNft;
}

export default function NFTCard(props: IProps) {
  const { nft } = props;
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);

  const toggleAccordion = () => {
    setIsAccordionOpen(!isAccordionOpen);
  };

  const toggleDescription = () => {
    setIsDescriptionOpen(!isDescriptionOpen);
  };

  if (!nft.title) {
    return null;
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-4 flex flex-col transition-transform duration-200 hover:scale-105 overflow-hidden">
      <div className="relative h-64 w-full mb-4">
        {nft.metadata.image_url ||
        nft.media[0].thumbnail ||
        nft.metadata.image ||
        nft.media[0].raw ? (
          <Image
            src={
              nft.metadata.image_url ??
              nft.media[0].thumbnail ??
              nft.metadata.image ??
              nft.media[0].raw ??
              ""
            }
            alt={nft.metadata.name ?? "NFT Image"}
            layout="fill"
            objectFit="cover"
            className="rounded-lg"
            unoptimized={true}
          />
        ) : (
          <div className="bg-gray-200 h-full w-full rounded-lg flex items-center justify-center">
            <span className="text-gray-500">No Image Available</span>
          </div>
        )}
      </div>

      <div className="flex flex-col space-y-2">
        <h4 className="text-xl font-semibold text-gray-900">
          {nft.metadata.name ?? "Untitled"}
        </h4>

        {/* Expandable Description */}
        <div className="mt-2">
          <button
            onClick={toggleDescription}
            className="bg-gray-200 px-4 py-2 w-full text-left font-semibold text-gray-800 rounded"
          >
            {isDescriptionOpen ? "Hide Description" : "Show Description"}
          </button>
          {isDescriptionOpen && (
            <div className="mt-2 bg-gray-100 rounded-lg p-4">
              <p className="text-sm text-gray-600">
                {nft.metadata.description ?? "No description available."}
              </p>
            </div>
          )}
        </div>

        {nft.contractMetadata && (
          <div className="mt-4">
            <p className="text-sm text-gray-500">
              <strong>Collection:</strong> {nft.contractMetadata.name}
            </p>
          </div>
        )}

        {/* Copy contract address to clipboard */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              navigator.clipboard.writeText(nft.contract.address);
            }}
            className="text-sm text-blue-500 hover:underline"
          >
            Copy Address
          </button>
        </div>

        <div className="mt-2 flex space-x-2">
          {nft.metadata.external_url && (
            <a
              href={nft.metadata.external_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              View on External Site
            </a>
          )}
          <a
            href={`https://etherscan.io/token/${nft.contract.address}?a=${nft.id.tokenId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            View on Etherscan
          </a>
        </div>

        {/* Accordion for Token Metadata */}
        {nft.metadata.attributes && (
          <div className="mt-4">
            <button
              onClick={toggleAccordion}
              className="bg-gray-200 px-4 py-2 w-full text-left font-semibold text-gray-800 rounded"
            >
              {isAccordionOpen ? "Hide Attributes" : "Show Attributes"}
            </button>

            {isAccordionOpen && (
              <div className="mt-2 bg-gray-100 rounded-lg p-4">
                {nft.metadata.attributes.map((attribute, index) => (
                  <div key={index} className="mb-2">
                    <p className="text-sm text-gray-600">
                      <strong>{attribute.trait_type}:</strong> {attribute.value}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
