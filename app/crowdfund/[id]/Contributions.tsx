import { useState } from 'react';
import Link from 'next/link';
import React from 'react'
import { INeynarUserResponse } from '@/types/interfaces';

interface ContributionsProps {
  contributors: string[];
  contributionsUSD: number[];
  donorProfiles: Record<string, INeynarUserResponse[]> | null;
}

export default function Contributions({ contributors, contributionsUSD, donorProfiles }: ContributionsProps) {
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  return (
    <div className="bg-gray-100 p-4 rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Contributors</h2>
      {contributors.length === 0 ? (
        <p>No contributors yet. Be the first to donate!</p>
      ) : (
        <>
          {donorProfiles && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {contributors.map((contributor, index) => {
                const profile = donorProfiles[contributor.toLowerCase()];
                const neynarProfile = profile && profile.length > 0 ? profile[0] : null;
                return renderDonorCard(
                  contributor,
                  neynarProfile,
                  contributionsUSD[index],
                  handleCopyAddress,
                  copiedAddress,
                  index
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}

const renderDonorCard = (
  address: string,
  neynarProfile: INeynarUserResponse | null,
  contributionUSD: number,
  handleCopyAddress: (address: string) => void,
  copiedAddress: string | null,
  index: number // Add this line
) => {
  const cardContent = (
    <>
      <div className="flex flex-col items-center">
        {neynarProfile?.pfp_url ? (
          <img src={neynarProfile.pfp_url} alt="Profile" className="w-12 h-12 rounded-full mb-2" />
        ) : (
          <div className="w-12 h-12 bg-gray-300 rounded-full mb-2"></div>
        )}
        <span className="text-sm text-center">{neynarProfile?.display_name || neynarProfile?.username || `${address.slice(0, 6)}...${address.slice(-4)}`}</span>
      </div>
      <span className="mt-2 text-sm font-medium">${contributionUSD?.toFixed(2) ?? '0.00'}</span>
    </>
  );

  const cardClasses = "bg-white p-3 rounded-md shadow-sm flex flex-col items-center justify-between transition-all duration-300 hover:shadow-md cursor-pointer h-full";

  if (neynarProfile) {
    return (
      <Link href={`/profile/${neynarProfile.fid}`} className={cardClasses} key={`donor-${index}`}>
        {cardContent}
      </Link>
    );
  } else {
    return (
      <div 
        onClick={() => handleCopyAddress(address)} 
        className={`${cardClasses} relative`}
        key={`donor-${index}`}
      >
        {cardContent}
        {copiedAddress === address && (
          <span className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full bg-black text-white text-xs py-1 px-2 rounded">
            Copied!
          </span>
        )}
      </div>
    );
  }
};
