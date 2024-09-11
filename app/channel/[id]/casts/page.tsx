// pages/channel/[id]/casts.tsx
import React from "react";
import { getChannelById, getUsersByFids } from "@/middleware/helpers";
import CastsContainer from "./CastsContainer";
import ChannelLayout from "../ChannelLayout";

type Props = {
  params: { id: string };
};

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

  return (
    <ChannelLayout channel={channel} leadMember={leadMember[0]}>
      <CastsContainer channelId={channel.id} />
    </ChannelLayout>
  );
}
