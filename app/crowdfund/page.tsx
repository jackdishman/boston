import { getAllCrowdfunds } from '@/middleware/crowdfund';
import React from 'react'

interface Crowdfund {
  id: number;
  name?: string;
  description?: string;
  target_amount?: number;
  created_at: string;
  contract_address: string;
}

export default async function page() {

  // get all crowdfunds
  const crowdfunds = await getAllCrowdfunds();

  console.log(crowdfunds);
  return (
    <div>Crowdfunding page</div>
  )
}
