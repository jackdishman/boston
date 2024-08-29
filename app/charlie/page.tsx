import React from "react";

export async function generateMetadata() {
  const fcMetadata: Record<string, string> = {
    "fc:frame": "vNext",
    "fc:frame:image": `${process.env.NEXT_PUBLIC_HOST}/charlie-final.jpg`,
    "fc:frame:button:1": `Generate Your Charlie Card`,
    "fc:frame:post_url": `${process.env.NEXT_PUBLIC_HOST}/api/frames/charlie/generate`,
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
    <section className="flex min-h-screen flex-col items-center justify-center overflow-x-hidden p-10"></section>
  );
}
