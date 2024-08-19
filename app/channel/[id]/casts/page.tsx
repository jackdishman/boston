// pages/channel/[id]/casts.tsx
import React from "react";
import { IChannelResponse, INeynarCastResponse } from "@/types/interfaces";
import { getChannelById, getUsersByFids } from "@/middleware/helpers";
import { NeynarAPIClient, FeedType, FilterType } from "@neynar/nodejs-sdk";
import CastsContainer from "./CastsContainer";
import ChannelLayout from "../ChannelLayout";

type Props = {
  params: { id: string };
};

async function getChannelCasts(
  channelUrl: string
): Promise<INeynarCastResponse[] | null> {
  try {
    const client = new NeynarAPIClient(process.env.NEYNAR_API_KEY ?? "");
    const res = await client.fetchFeed(FeedType.Filter, {
      filterType: FilterType.ParentUrl,
      parentUrl: channelUrl,
      limit: 25,
    });
    return res.casts as unknown as INeynarCastResponse[];
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function generateMetadata({ params }: Props) {
  const channel = await getChannelById(params.id);
  const fcMetadata: Record<string, string> = {
    "fc:frame": "vNext",
    "fc:frame:image": `${process.env.NEXT_PUBLIC_HOST}/fc-og.png`,
    "fc:frame:button:1": `${params.id} Channel Site`,
    "fc:frame:button:1:action": `link`,
    "fc:frame:button:1:target": `${process.env.NEXT_PUBLIC_HOST}`,
  };

  return {
    title: params.id + " Channel",
    description: "Casts of the " + params.id + " channel",
    openGraph: {
      title: params.id + " Channel",
      description: "Casts of the " + params.id + " channel",
      images: [
        {
          url: `${process.env.NEXT_PUBLIC_HOST}`,
          width: 800,
          height: 600,
          alt: "og image",
        },
      ],
    },
    other: {
      ...fcMetadata,
    },
    metadataBase: new URL(`${process.env.NEXT_PUBLIC_HOST}`),
  };
}

export default async function Page({ params }: Props) {
  const channel = await getChannelById(params.id);
  if (!channel) return <div>Error fetching channel</div>;

  const leadMember = await getUsersByFids([channel.leadFid.toString()]);
  const hosts = await getUsersByFids(
    channel.hostFids.map((fid) => fid.toString())
  );

  const casts = await getChannelCasts(channel.url);
  if (!casts) return <div>Error fetching casts</div>;

  return (
    <ChannelLayout channel={channel} leadMember={leadMember[0]} hosts={hosts}>
      <CastsContainer casts={casts} />
    </ChannelLayout>
  );
}
