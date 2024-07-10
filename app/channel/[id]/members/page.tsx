import React from "react";
import { IChannelUsersResponse, INeynarUserResponse } from "@/types/interfaces";
import FollowersList from "../../../components/FollowersList";
import { getChannelFids, getUsersByFids } from "@/middleware/helpers";

type Props = {
  params: { id: string };
};

export async function generateMetadata({ params }: Props) {
  const fcMetadata: Record<string, string> = {
    "fc:frame": "vNext",
    "fc:frame:image": "https://boston-five.vercel.app/fc-og.png",
    "fc:frame:button:1": `${params.id} Channel Site`,
    "fc:frame:button:1:action": `link`,
    "fc:frame:button:1:target": `https://boston-five.vercel.app`,
  };

  return {
    title: params.id + " Channel",
    description: "members of the " + params.id + " channel",
    openGraph: {
      title: params.id + " Channel",
      description: "members of the " + params.id + " channel",
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

export default async function Page() {
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
