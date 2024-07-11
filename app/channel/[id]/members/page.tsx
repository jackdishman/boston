import React from "react";
import FollowersList from "./FollowersList";
import {
  getUsersByFids,
  getChannelById,
  fetchChannelFollowerFids,
  splitIntoBatches,
} from "@/middleware/helpers";
import ChannelLayout from "../ChannelLayout";

type Props = {
  params: { id: string };
};

export async function generateMetadata({ params }: Props) {
  const channel = await getChannelById(params.id);
  const fcMetadata: Record<string, string> = {
    "fc:frame": "vNext",
    "fc:frame:image": "https://boston-five.vercel.app/fc-og.png",
    "fc:frame:button:1": `${params.id} Channel Site`,
    "fc:frame:button:1:action": `link`,
    "fc:frame:button:1:target": `https://boston-five.vercel.app`,
  };

  return {
    title: params.id + " Channel",
    description: "Members of the " + params.id + " channel",
    openGraph: {
      title: params.id + " Channel",
      description: "Members of the " + params.id + " channel",
      images: [
        {
          url: "https://boston-five.vercel.app/fc-og.png",
          width: 800,
          height: 600,
          alt: "og image",
        },
      ],
    },
    other: {
      ...fcMetadata,
    },
    metadataBase: new URL("https://boston-five.vercel.app"),
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

  const users = await fetchChannelFollowerFids(params.id);

  if (!users || users.length === 0) return <div>Error fetching users</div>;

  const batches = splitIntoBatches(users, 50);

  // Get first batch and then pop it off
  const firstBatch = batches.shift();
  if (!firstBatch) return <div>Error fetching first batch</div>;

  const usersBatch = await getUsersByFids(
    firstBatch.map((item) => item.fid.toString())
  );

  return (
    <ChannelLayout channel={channel} leadMember={leadMember[0]} hosts={hosts}>
      <FollowersList
        allChannelFids={users}
        firstBatch={usersBatch}
        toFetch={batches}
        channelId={params.id}
        numChannelMembers={users.length}
      />
    </ChannelLayout>
  );
}
