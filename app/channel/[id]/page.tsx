import { getUsersByFids } from "@/middleware/helpers";
import {
  ApiResponse,
  IChannelResponse,
  INeynarUserResponse,
} from "@/types/interfaces";
import React from "react";
import ChannelNav from "./ChannelNav";

type Props = {
  params: { id: string };
};

async function getChannelById(id: string): Promise<IChannelResponse | null> {
  try {
    const response = await fetch(
      `https://api.warpcast.com/v1/channel?channelId=${id}`
    );
    const data: ApiResponse = await response.json();
    return data.result.channel as IChannelResponse;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function generateMetadata({ params }: Props) {
  const channel = await getChannelById(params.id);
  const fcMetadata: Record<string, string> = {
    "fc:frame": "vNext",
    "fc:frame:image": "https://boston-five.vercel.app/fc-og.png",
    "fc:frame:button:1": `Channel Site`,
    "fc:frame:button:1:action": `link`,
    "fc:frame:button:1:target": `https://boston-five.vercel.app`,
  };

  return {
    title: channel?.name + " Channel",
    description: channel?.description,
    openGraph: {
      title: channel?.name,
      description: channel?.description,
      images: [
        {
          url: channel?.imageUrl,
          width: 800,
          height: 600,
          alt: channel?.description,
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
  const hosts = await getUsersByFids(
    channel.hostFids.map((fid) => fid.toString())
  );

  const MemberPreview = (member: INeynarUserResponse) => {
    return (
      <a
        href={`https://warpcast.com/${member.username}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <div className="flex items-center p-2 border border-gray-200 rounded-lg mb-2 hover:bg-gray-50 transition">
          <img
            src={member.pfp_url}
            alt={member.username}
            className="w-12 h-12 rounded-full"
          />
          <div className="ml-4">
            <p className="text-lg font-semibold text-gray-800">
              {member.display_name}
            </p>
            <p className="text-sm text-gray-600">@{member.username}</p>
            <p className="text-sm text-gray-500">FID: {member.fid}</p>
          </div>
        </div>
      </a>
    );
  };

  return (
    <section className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-10">
      <article className="bg-white rounded-lg shadow-lg text-center p-6 sm:p-8 w-full max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          {channel.name}
        </h1>
        <div className="flex flex-col sm:flex-row items-center mb-6">
          <img
            src={channel.imageUrl}
            alt={channel.description}
            className="w-32 h-32 rounded mb-4 sm:mb-0 sm:mr-4"
          />
          <div className="text-left">
            <p className="text-lg text-gray-700 mb-2">{channel.description}</p>
            <p className="text-gray-600">Followers: {channel.followerCount}</p>
            <p className="text-gray-600">
              Created on{" "}
              {new Date(channel.createdAt * 1000).toLocaleDateString()}
            </p>
          </div>
        </div>
        <ChannelNav />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-lg font-semibold text-gray-700 mb-2">Lead:</p>
            <MemberPreview {...leadMember[0]} />
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-700 mb-2">Hosts:</p>
            {hosts.map((h) => (
              <MemberPreview key={h.fid} {...h} />
            ))}
          </div>
        </div>
        <a
          className="text-blue-600 mt-6 inline-block font-semibold"
          href={channel.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          View Channel on Warpcast
        </a>
      </article>
    </section>
  );
}
