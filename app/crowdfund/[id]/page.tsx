import { getCrowdfund } from '@/middleware/crowdfund';
import React from 'react'
import CrowdfundContainer from './CrowdfundContainer';

export default async function Page({ params }: { params: { id: string } }) {
  const { id } = params;
  
  // get crowdfund by id
  const crowdfund = await getCrowdfund(id);
  console.log(crowdfund);

  const contractAddress = crowdfund?.contract_address;



  return (
    <div>
      <CrowdfundContainer contractAddress={contractAddress} />
    </div>
  )
}
