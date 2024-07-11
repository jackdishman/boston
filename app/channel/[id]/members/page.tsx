// pages/channel/[id]/members.tsx
import React from "react";
import { IChannelUsersResponse, INeynarUserResponse } from "@/types/interfaces";
import FollowersList from "./FollowersList";
import {
  getChannelFids,
  getUsersByFids,
  getChannelById,
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
  const fetchUsers = async (
    channelId: string
  ): Promise<INeynarUserResponse[]> => {
    let cursor: string | null = null;
    const allFollowers: IChannelUsersResponse[] = [];
    const allUsers: INeynarUserResponse[] = [];

    do {
      const { followers, nextCursor } = await getChannelFids(channelId, cursor);
      allFollowers.push(...followers);
      cursor = nextCursor;
    } while (cursor);

    const fids = allFollowers.map((item) => item.fid);
    const batchSize = 100;

    for (let i = 0; i < fids.length; i += batchSize) {
      const batchFids = fids.slice(i, i + batchSize);
      const users = await getUsersByFids(batchFids);
      users.forEach((user) => {
        const follower = allFollowers.find(
          (f) => f.fid === user.fid.toString()
        );
        if (follower) {
          (user as any).followedAt = follower.followedAt;
        }
      });
      allUsers.push(...users);
    }
    return allUsers;
  };

  const channel = await getChannelById(params.id);
  if (!channel) return <div>Error fetching channel</div>;

  const leadMember = await getUsersByFids([channel.leadFid.toString()]);
  const hosts = await getUsersByFids(
    channel.hostFids.map((fid) => fid.toString())
  );

  const users = await fetchUsers(params.id);
  if (!users || users.length === 0) return <div>Error fetching users</div>;

  return (
    <ChannelLayout channel={channel} leadMember={leadMember[0]} hosts={hosts}>
      <FollowersList users={users} />
    </ChannelLayout>
  );
}
