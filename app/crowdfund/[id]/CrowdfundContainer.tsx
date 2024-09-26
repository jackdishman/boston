"use client"

import React, { useEffect, useState } from 'react';
import { getCrowdfundABI, getCrowdfundBytecode } from '@/middleware/crowdfund';
import { base } from 'viem/chains';
import { createPublicClient, createWalletClient, custom, http } from 'viem';

export default function CrowdfundContainer({ contractAddress }: { contractAddress: string }) {
  const [contributors, setContributors] = useState<string[]>([]);
  const [contractABI, setContractABI] = useState<any>(null);
  const [totalAmountRaised, setTotalAmountRaised] = useState<string>('');

  // Initialize clients
  const publicClient = createPublicClient({ chain: base, transport: http() });
  const walletClient = createWalletClient({ chain: base, transport: custom(window.ethereum) });

  // Fetch ABI and Bytecode once
  useEffect(() => {
    const fetchContractData = async () => {
      try {
        const abi = await getCrowdfundABI();
        setContractABI(abi);
      } catch (error) {
        console.error("Error fetching ABI:", error);
      }
    };
    fetchContractData();
  }, []);

  // Fetch contributors and total amount raised when contractABI and contractAddress are available
  useEffect(() => {
    if (!contractABI || !contractAddress) return;

    const fetchContributors = async () => {
      try {
        const contributorsList = await publicClient.readContract({
          address: contractAddress as `0x${string}`,
          abi: contractABI,
          functionName: 'getContributors',
          args: [], // Add this line
        }) as string[];
        setContributors(contributorsList);
      } catch (error) {
        console.error("Error fetching contributors:", error);
      }
    };

    const fetchTotalAmountRaised = async () => {
      try {
        const totalAmountRaised = await publicClient.readContract({
          address: contractAddress as `0x${string}`,
          abi: contractABI,
          functionName: 'totalRaisedInUSD',
          args: [],
        }) as bigint;

        const formattedRaised = (parseInt(totalAmountRaised.toString()) / 100).toFixed(2);
        setTotalAmountRaised(`$${formattedRaised}`);
      } catch (error) {
        console.error('Error fetching total amount raised:', error);
      }
    };

    fetchContributors();
    fetchTotalAmountRaised();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contractABI, contractAddress]);

  return (
    <div>
      <h2>Contributors</h2>
      {contributors.length === 0 ? (
        <p>No contributors found.</p>
      ) : (
        <ul>
          {contributors.map((contributor, index) => (
            <li key={index}>{contributor}</li>
          ))}
        </ul>
      )}
      <p>Total amount raised: {totalAmountRaised}</p>
    </div>
  );
}
