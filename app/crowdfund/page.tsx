import { getAllCrowdfunds } from '@/middleware/crowdfund';
import { ICrowdfund } from '@/types/crowdfund';
import Link from 'next/link';
import React from 'react'
import CrowdfundContainer from './CrowdfundContainer';

export default async function page() {

  // get all crowdfunds
  const crowdfunds: ICrowdfund[] | null = await getAllCrowdfunds();

  if(!crowdfunds) {
    return <div>No crowdfunds available at the moment.</div>
  }

  return (
    <div>
      <div className="flex justify-end my-4">
        <Link href="/crowdfund/create" className="bg-blue-500 text-white px-4 py-2 rounded-md">Create Crowdfund</Link>
      </div>
      <h1 className="text-2xl font-bold mb-4">All Crowdfunds</h1>
      <CrowdfundContainer crowdfunds={crowdfunds} />
    </div>
  )
}
