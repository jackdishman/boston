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

export default async function Page() {
  return (
    <section className="flex min-h-screen flex-col items-center justify-center overflow-x-hidden  p-10">
      <article className="flex flex-col items-center justify-center bg-white rounded-lg shadow-lg text-center ">
        <div className="p-8">
          <p className="text-2xl text-gray-700 mb-4">
            A page for all things Boston 🦞
          </p>
          <p className="text-lg text-gray-600">
            Browse channel members, network with locals, and view recent casts.
          </p>
          <p className="text-lg text-gray-600 mt-4 font-semibold">
            Coming soon:
          </p>
          <div className="flex justify-center">
            <ul className="text-start text-gray-600 list-disc my-2">
              <li>Networking registry for Boston professionals</li>
              <li>Browse upcoming Events in Boston and the surrounding area</li>
              <li>Job board for local Boston opportunities</li>
              <li>Local bounties and projects</li>
              <li>
                Contribute to visitor guides and recommendations for rewards
              </li>
            </ul>
          </div>
          <a
            className="text-lg text-gray-600 my-2 font-semibold"
            href="https://warpcast.com/~/channel/boston"
            target="_blank"
          >
            Request a feature in the /boston channel!
          </a>
        </div>
      </article>
    </section>
  );
}
