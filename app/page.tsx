import React from "react";
import RecentEvents from "./components/RecentEvents";

export async function generateMetadata() {
  const fcMetadata: Record<string, string> = {
    "fc:frame": "vNext",
    "fc:frame:image": `${process.env.NEXT_PUBLIC_HOST}/fc-og.png`,
    "fc:frame:button:1": `Channel Site`,
    "fc:frame:button:1:action": `link`,
    "fc:frame:button:1:target": `${process.env.NEXT_PUBLIC_HOST}`,
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
          url: `${process.env.NEXT_PUBLIC_HOST}/fc-og.png`,
          width: 800,
          height: 600,
          alt: "Get detailed information about channels, including members, events, and casts.",
        },
      ],
    },
    other: {
      ...fcMetadata,
    },
    metadataBase: new URL(`${process.env.NEXT_PUBLIC_HOST}`),
  };
}

export default function Page() {
  return (
    <section className="flex flex-col lg:flex-row min-h-screen p-4 lg:p-10">
      <article className="flex-1 bg-white rounded-lg shadow-lg border border-gray-300 p-6 lg:p-8 mb-6 lg:mb-0 lg:mr-4">
        <h1 className="text-xl lg:text-3xl text-gray-700 mb-4">
          Your Farcaster explorer and more!
        </h1>
        <p className="text-md lg:text-lg text-gray-600 mb-4">
          Features include:
        </p>
        <ul className="text-md lg:text-lg text-gray-600 list-disc list-inside space-y-2">
          <li>Search Farcaster channels and profiles</li>
          <li>View Credentials, Highlights, and Work Experiences of fids</li>
          <li>
            Browse Farcaster profile account token balances (ETH and Base)
          </li>
          <li>View most active casters in a channel and feeds</li>
          <li>Trivia Quiz Frame, with rewards denominated in Stack.so</li>
          <li>Create and take quizzes in this app</li>
          <li>
            Install cast action to check caster account balances in Warpcast
          </li>
        </ul>
      </article>
      <aside className="w-full lg:w-80 h-64 lg:h-auto lg:max-h-screen lg:flex-shrink-0 bg-white rounded-lg shadow-lg border border-gray-300">
        <RecentEvents />
      </aside>
    </section>
  );
}
