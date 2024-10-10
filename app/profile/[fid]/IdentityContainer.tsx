"use client";

import { Avatar, Identity, Name, Badge, Address } from '@coinbase/onchainkit/identity';
 
export default function IdentityContainer({ address }: { address: `0x${string}` }) {
  return (
    <Identity
      address={address}
      schemaId="0xf8b05c79f090979bf4a80270aba232dff11a10d9ca55c4f88de95317970f0de9"
    >
      <Name>
        <Badge />
      </Name>
      <Address />
    </Identity>
  );
}
