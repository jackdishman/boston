"use client";

import { OnchainKitProvider } from '@coinbase/onchainkit'; 
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { base } from 'viem/chains'; 
import { type ReactNode, useState } from 'react';
import { type State, WagmiProvider } from 'wagmi';
import { http, createConfig } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'

export const wagmiConfig = createConfig({
  chains: [mainnet, sepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
})
 
export function Providers(props: {
  children: ReactNode;
  initialState?: State;
}) {
  const [config] = useState(wagmiConfig);
  const [queryClient] = useState(() => new QueryClient());
 
  return (
    <WagmiProvider config={config} initialState={props.initialState}>
      <QueryClientProvider client={queryClient}>
        <OnchainKitProvider
          apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
          chain={base}
        >
          {props.children}
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default Providers;