import React from "react";
import {
  IChannelFollowersResponse,
  IChannelUsersResponse,
  INeynarUserResponse,
} from "@/types/interfaces";
import FollowersList from "../components/FollowersList";

export async function generateMetadata() {
  const fcMetadata: Record<string, string> = {
    "fc:frame": "vNext",
    "fc:frame:image": "https://boston-five.vercel.app/boston.png",
    "fc:frame:button:1": `Channel Site`,
    "fc:frame:button:1:action": `link`,
    "fc:frame:button:1:target": `https://boston-five.vercel.app`,
  };

  return {
    title: "Boston Channel",
    description:
      "All things Boston Blockchain! Events, network, jobs, and more! 🦞",
    openGraph: {
      title: "Boston 🦞 FC",
      description:
        "All things Boston Blockchain! Events, network, jobs, and more! 🦞",
      images: [
        {
          url: "https://boston-five.vercel.app/boston.png",
          width: 800,
          height: 600,
          alt: "All things Boston Blockchain! Events, network, jobs, and more! 🦞",
        },
      ],
    },
    other: {
      ...fcMetadata,
    },
    metadataBase: new URL("https://boston-five.vercel.app"),
  };
}

export default async function Page() {
  const getChannelFids = async (
    nextCursor?: string | null
  ): Promise<{
    followers: IChannelUsersResponse[];
    nextCursor: string | null;
  }> => {
    try {
      const response = await fetch(
        `https://api.warpcast.com/v1/channel-followers?channelId=boston${
          nextCursor ? `&cursor=${nextCursor}` : ""
        }`
      );
      const data: IChannelFollowersResponse = await response.json();
      const followers: IChannelUsersResponse[] = data.result.users.map(
        (item) => ({
          fid: item.fid,
          followedAt: item.followedAt,
        })
      );
      return { followers, nextCursor: data.next?.cursor || null };
    } catch (error) {
      console.error(error);
      return { followers: [], nextCursor: null };
    }
  };

  const getUsersByFids = async (
    fids: string[]
  ): Promise<INeynarUserResponse[]> => {
    try {
      const fidString = fids.join("%2C");
      const url = `https://api.neynar.com/v2/farcaster/user/bulk?fids=${fidString}`;
      const options = {
        method: "GET",
        headers: {
          accept: "application/json",
          api_key: process.env.NEYNAR_API_KEY ?? ``,
        },
      };
      const response = await fetch(url, options);
      const data = await response.json();
      return data.users as INeynarUserResponse[];
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  const fetchUsers = async (): Promise<INeynarUserResponse[]> => {
    let cursor: string | null = null;
    const allFollowers: IChannelUsersResponse[] = [];
    const allUsers: INeynarUserResponse[] = [];

    do {
      const { followers, nextCursor } = await getChannelFids(cursor);
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

  const users = await fetchUsers();

  if (!users || users.length === 0) return <div>Error fetching users</div>;

  return (
    <section className="flex min-h-screen flex-col items-center justify-between overflow-x-hidden">
      <article className="flex flex-col items-center justify-center">
        <FollowersList users={users} />
      </article>
    </section>
  );
}
