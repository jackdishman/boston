// pages/channel/[id]/events.tsx
import React from "react";
import { getChannelById, getUsersByFids } from "@/middleware/helpers";
import ChannelLayout from "../ChannelLayout";
import { EventStats } from "@/types/interfaces";
import { EventsStats } from "./EventsStats";

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
    description: "Events of the " + params.id + " channel",
    openGraph: {
      title: params.id + " Channel",
      description: "Events of the " + params.id + " channel",
      images: [
        {
          url: `${process.env.NEXT_PUBLIC_HOST}/fc-og.png`,
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
  const hosts =
    channel.hostFids && channel.hostFids.length > 0
      ? await getUsersByFids(channel.hostFids.map((fid) => fid.toString()))
      : [];

  const events = await fetch(
    `https://events.xyz/api/reports/channel/${params.id}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": "sufficiently-centralized",
      },
    }
  );
  if (!events.ok)
    return (
      <ChannelLayout channel={channel} leadMember={leadMember[0]} hosts={hosts}>
        <div className="text-center text-xl">Error fetching events</div>
      </ChannelLayout>
    );
  const stats = (await events.json()) as EventStats;

  return (
    <ChannelLayout channel={channel} leadMember={leadMember[0]} hosts={hosts}>
      <EventsStats stats={stats} />
    </ChannelLayout>
  );
}
