import React from "react";
import {
  IChannelFollowersResponse,
  IChannelUsersResponse,
  INeynarUserResponse,
} from "@/types/interfaces";
import FollowersList from "./components/FollowersList";

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

export default async function Pger() {
  return (
    <section className="flex min-h-screen flex-col items-center justify-between overflow-x-hidden">
      <article className="flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold">Boston Channel</h1>
        <p className="text-lg">
          All things Boston Blockchain! Events, network, jobs, and more! 🦞
        </p>
      </article>
    </section>
  );
}
