"use client"

import React, { useEffect, useState } from 'react'
import { ICrowdfund } from '@/types/crowdfund';
import { getCrowdfundABI } from '@/middleware/crowdfund';
import CrowdfundItem from './CrowdfundItem';

export default function CrowdfundContainer({ crowdfunds }: { crowdfunds: ICrowdfund[] }) {
  const [contractABI, setContractABI] = useState<any>(null);

  // Fetch ABI once
  useEffect(() => {
    const fetchContractData = async () => {
      try {
        const crowdfundAbi = await getCrowdfundABI();
        setContractABI(crowdfundAbi);
      } catch (error) {
        console.error("Error fetching ABI:", error);
      }
    };
    fetchContractData();
  }, []);
  
  return (
    <div>
      <ul className="space-y-4">
        {crowdfunds.map((crowdfund) => (
          <CrowdfundItem 
            key={crowdfund.id} 
            crowdfund={crowdfund} 
            contractABI={contractABI}
          />
        ))}
      </ul>
    </div>
  );
}
