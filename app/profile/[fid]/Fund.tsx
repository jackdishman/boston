"use client"

import React from 'react'
import { FundButton, getOnrampBuyUrl } from '@coinbase/onchainkit/fund';
 
export default function Fund({ account }: { account: `0x${string}` }) {
 
const onrampBuyUrl = getOnrampBuyUrl({
  projectId: process.env.COINBASE_API_KEY || "",
  addresses: { address: [account] },
  assets: ['USDC'],
  presetFiatAmount: 20,
  fiatCurrency: 'USD'
});
 

  return (
    <div>
      <FundButton fundingUrl={onrampBuyUrl} openIn={"tab"} />
    </div>
  )
}
