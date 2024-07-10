import { getAllChannels } from "@/middleware/helpers";
import { IChannelResponse } from "@/types/interfaces";
import React from "react";
import ChannelList from "./components/ChannelList"; // Import ChannelList

export async function generateMetadata() {
  const fcMetadata: Record<string, string> = {
    "fc:frame": "vNext",
    "fc:frame:image": "https://boston-five.vercel.app/fc-og.png",
    "fc:frame:button:1": `Channel Site`,
    "fc:frame:button:1:action": `link`,
    "fc:frame:button:1:target": `https://boston-five.vercel.app`,
  };

  return {
    title: "Channel Explorer",
    description:
      "Get detailed information about channels, including members, events, and casts.",
    openGraph: {
      title: "Channel Explorer - search for channels and view their details",
      description:
        "Get detailed information about channels, including members, events, and casts.",
      images: [
        {
          url: "https://boston-five.vercel.app/fc-og.png",
          width: 800,
          height: 600,
          alt: "Get detailed information about channels, including members, events, and casts.",
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
  const channels = await getAllChannels();

  return (
    <section className="flex min-h-screen flex-col items-center justify-center overflow-x-hidden  p-10">
      <article className="flex flex-col items-center justify-center bg-white rounded-lg shadow-lg text-center ">
        <div className="p-8">
          <p className="text-2xl text-gray-700 mb-4">
            Explorer for ANY channel on Farcaster
          </p>
          <p className="text-lg text-gray-600">
            Enhanced view of channel followers, analyze channel casts, and more!
          </p>
          <p className="text-lg text-gray-600 mt-4 font-semibold">
            Future Features:
          </p>
          <div className="flex justify-center">
            <ul className="text-start text-gray-600 list-disc my-2">
              <li>Events.xyz integration to view local events</li>
              <li>BountyBot integration for channel-specific tasks</li>
              <li>Premium features for Hypersub subscribers</li>
            </ul>
          </div>
        </div>
      </article>

      <article className="w-full">
        <ChannelList channels={channels} />
      </article>
    </section>
  );
}
