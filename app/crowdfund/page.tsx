import { getAllCrowdfunds } from '@/middleware/crowdfund';
import Link from 'next/link';
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

  return (
    <div>
      <div className="flex justify-end my-4">
        <Link href="/crowdfund/create" className="bg-blue-500 text-white px-4 py-2 rounded-md">Create Crowdfund</Link>
      </div>
      <h1 className="text-2xl font-bold mb-4">All Crowdfunds</h1>
      {crowdfunds && crowdfunds.length > 0 ? (
        <ul className="space-y-4">
          {crowdfunds.map((crowdfund: Crowdfund) => (
            <li key={crowdfund.id} className="border p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <Link href={`/crowdfund/${crowdfund.id}`} className="block">
                <h2 className="text-xl font-semibold">{crowdfund.name || 'Unnamed Crowdfund'}</h2>
                <p className="text-gray-600 mt-2">{crowdfund.description || 'No description available'}</p>
                <div className="mt-2 text-sm text-gray-500">
                  Target Amount: {crowdfund.target_amount ? `$${crowdfund.target_amount.toLocaleString()}` : 'Not specified'}
                </div>
                <div className="mt-1 text-sm text-gray-500">
                  Created: {new Date(crowdfund.created_at).toLocaleDateString()}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p>No crowdfunds available at the moment.</p>
      )}
    </div>
  )
}
