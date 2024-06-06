import React from "react";
import {
  IChannelFollowersResponse,
  IChannelUsersResponse,
  INeynarUserResponse,
} from "@/types/interfaces";
import FollowersList from "./components/FollowersList";

export default async function Home() {
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
        headers: { accept: "application/json", api_key: "NEYNAR_API_DOCS" },
      };
      const response = await fetch(url, options);
      const data = await response.json();
      return data.users as INeynarUserResponse[];
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  const fetchData = async (): Promise<INeynarUserResponse[]> => {
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
      allUsers.push(...users);
    }

    return allUsers;
  };

  const users = await fetchData();

  if (!users || users.length === 0) return <div>Error fetching users</div>;

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold">Boston 🦞 FC</h1>
      <section className="flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-5">Followers ({users.length})</h2>
        <FollowersList users={users} />
      </section>
    </main>
  );
}
