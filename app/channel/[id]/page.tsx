import React from "react";
import { getChannelById, getUsersByFids } from "@/middleware/helpers";
import ChannelLayout from "./ChannelLayout";
import Skeleton from "@/app/components/Skeleton";

type Props = {
  params: { id: string };
};

export async function generateMetadata({ params }: Props) {
  const channel = await getChannelById(params.id);
  const fcMetadata: Record<string, string> = {
    "fc:frame": "vNext",
    "fc:frame:image": `${process.env.NEXT_PUBLIC_HOST}/fc-og.png`,
    "fc:frame:button:1": `Channel Site`,
    "fc:frame:button:1:action": `link`,
    "fc:frame:button:1:target": `${process.env.NEXT_PUBLIC_HOST}`,
  };

  return {
    title: `${channel?.name} Channel`,
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
    metadataBase: new URL(process.env.NEXT_PUBLIC_HOST ?? ``),
  };
}

export default async function Page({ params }: Props) {
  const channel = await getChannelById(params.id);

  if (!channel) return <div>Error fetching channel</div>;

  const [leadMember] = await getUsersByFids([channel.leadFid.toString()]);

  return (
    <React.Suspense fallback={<Skeleton />}>
      <ChannelLayout channel={channel} leadMember={leadMember}>
        <p className="text-center"></p>
      </ChannelLayout>
    </React.Suspense>
  );
}
