import { Metadata, ResolvingMetadata } from "next";
import { getCrowdfund } from '@/middleware/crowdfund';
import React from 'react'
import CrowdfundContainer from './CrowdfundContainer';

type Props = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const id = params.id;
  const crowdfund = await getCrowdfund(id);
  if (!crowdfund) {
    return {
      title: "Crowdfund not found",
      openGraph: {
        title: "Crowdfund not found",
        description: "Crowdfund not found",
      },
      metadataBase: new URL(process.env["NEXT_PUBLIC_HOST"] || ""),
    };
  }
  const imageUrl = `${process.env["NEXT_PUBLIC_HOST"]}/api/frames/crowdfund/image?title=${crowdfund.title}&description=${crowdfund.description}`;
  const fcMetadata: Record<string, string> = {
    "fc:frame": "vNext",
    "fc:frame:post_url": `${process.env["NEXT_PUBLIC_HOST"]}/api/frames/crowdfund/contribute?id=${id}`,
    "fc:frame:image": imageUrl,
    "fc:frame:button:1": `Contribute`,
    "fc:frame:button:2": `View in App`,
    "fc:frame:button:2:action": `link`,
    "fc:frame:button:2:target": `${process.env["NEXT_PUBLIC_HOST"]}/crowdfund/${id}`,
    "fc:frame:button:3": `Create a Crowdfund`,
    "fc:frame:button:3:action": `link`,
    "fc:frame:button:3:target": `${process.env["NEXT_PUBLIC_HOST"]}/crowdfund/create`,
  };

  return {
    title: crowdfund.title,
    openGraph: {
      title: crowdfund.title ?? `Crowdfund ${id}`,
      description: crowdfund.description ?? `Crowdfund ${id}`,
      images: [{ url: imageUrl }],
    },
    other: {
      ...fcMetadata,
    },
    metadataBase: new URL(process.env["NEXT_PUBLIC_HOST"] || ""),
  };
}

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
