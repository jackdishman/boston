// pages/channel/[id]/members.tsx
import React from "react";
import FollowersList from "./FollowersList";
import {
  getUsersByFids,
  getChannelById,
  fetchUsers,
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

  if (channel.followerCount > 10000) {
    return (
      <ChannelLayout channel={channel} leadMember={leadMember[0]} hosts={hosts}>
        <div className="flex justify-center ">
          <h1 className="bg-red-600 text-white font-semibold p-5 rounded-lg">
            Too many followers to display. Working on a solution to handle this
          </h1>
        </div>
      </ChannelLayout>
    );
  }

  const users = await fetchUsers(params.id);
  if (!users || users.length === 0) return <div>Error fetching users</div>;

  return (
    <ChannelLayout channel={channel} leadMember={leadMember[0]} hosts={hosts}>
      <FollowersList users={users} />
    </ChannelLayout>
  );
}
