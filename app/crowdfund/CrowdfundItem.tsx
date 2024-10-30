"use client"

import React, { useEffect, useState, useMemo } from 'react'
import { ICrowdfund } from '@/types/crowdfund';
import Link from 'next/link';
import { getCrowdfundABI } from '@/middleware/crowdfund';
import { base } from 'viem/chains';
import { createPublicClient, http } from 'viem';

interface CrowdfundItemProps {
  crowdfund: ICrowdfund;
  contractABI: any;
}

export default function CrowdfundItem({ crowdfund, contractABI }: CrowdfundItemProps) {
  const [onChainData, setOnChainData] = useState<{
    totalRaised?: string;
    targetAmount?: string;
    contributorsCount?: number;
  }>({});

  // Memoize the public client
  const publicClient = useMemo(() => 
    createPublicClient({ 
      chain: base, 
      transport: http() 
    }),
    [] // Empty dependency array as these values never change
  );

  useEffect(() => {
    const fetchCrowdfundData = async () => {
      try {
        // Batch all contract reads into a single multicall
        const [totalRaised, targetAmount, contributors] = await publicClient.multicall({
          contracts: [
            {
              address: crowdfund.contract_address as `0x${string}`,
              abi: contractABI,
              functionName: 'totalRaisedInUSD',
              args: [],
            },
            {
              address: crowdfund.contract_address as `0x${string}`,
              abi: contractABI,
              functionName: 'targetAmountInUSD',
              args: [],
            },
            {
              address: crowdfund.contract_address as `0x${string}`,
              abi: contractABI,
              functionName: 'getContributors',
              args: [],
            },
          ],
        });

        console.log(totalRaised, targetAmount);
        const totalRaisedResult = BigInt(totalRaised.result as string);
        const targetAmountResult = BigInt(targetAmount.result as string);
        console.log(totalRaisedResult, targetAmountResult);
        setOnChainData({
          totalRaised: `$${(Number(totalRaisedResult) / 100).toFixed(2)}`,
          targetAmount: `$${(Number(targetAmountResult) / 1e6).toFixed(2)}`,
          contributorsCount: Array.isArray(contributors.result) ? contributors.result.length : 0,
        });
      } catch (error) {
        console.error(`Error fetching data for crowdfund ${crowdfund.id}:`, error);
      }
    };

    if (contractABI) {
      fetchCrowdfundData();
    }
  }, [crowdfund.contract_address, crowdfund.id, contractABI, publicClient]);

  const calculateProgress = () => {
    if (!onChainData.totalRaised || !onChainData.targetAmount) return 0;
    const raised = parseFloat(onChainData.totalRaised.replace('$', ''));
    const target = parseFloat(onChainData.targetAmount.replace('$', ''));
    return Math.min((raised / target) * 100, 100);
  };

  return (
    <Link 
      href={`/crowdfund/${crowdfund.id}`} 
      className="block bg-white p-6 rounded-lg transition-all hover:shadow-lg border border-gray-100 hover:border-gray-200"
    >
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{crowdfund.name || 'Unnamed Crowdfund'}</h2>
          <p className="text-gray-600 mt-2 line-clamp-2">{crowdfund.description || 'No description available'}</p>
        </div>
        <div className="bg-blue-50 p-2 rounded-full">
          <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>

      <div className="mt-6">
        {onChainData.totalRaised && onChainData.targetAmount && (
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-sm font-medium text-gray-700">
                {calculateProgress().toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" 
                style={{ width: `${calculateProgress()}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-sm text-gray-600">{onChainData.totalRaised}</span>
              <span className="text-sm text-gray-600">{onChainData.targetAmount}</span>
            </div>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between text-sm">
          <div className="flex items-center text-gray-500">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            {onChainData.contributorsCount !== undefined && (
              <span>{onChainData.contributorsCount} Contributors</span>
            )}
          </div>
          <div className="text-gray-500">
            Created: {new Date(crowdfund.created_at).toLocaleDateString()}
          </div>
        </div>
      </div>
    </Link>
  );
}