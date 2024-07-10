import React from "react";
import {
  ApiResponse,
  IChannelResponse,
  INeynarCastResponse,
} from "@/types/interfaces";
import { NeynarAPIClient, FeedType, FilterType } from "@neynar/nodejs-sdk";
import CastsContainer from "./CastsContainer";
import ChannelNav from "../ChannelNav";

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

async function getChannelCasts(
  channelUrl: string
): Promise<INeynarCastResponse[] | null> {
  try {
    const client = new NeynarAPIClient(process.env.NEYNAR_API_KEY ?? "");
    const res = await client.fetchFeed(FeedType.Filter, {
      filterType: FilterType.ParentUrl,
      parentUrl: channelUrl,
      limit: 25,
    });
    return res.casts as unknown as INeynarCastResponse[];
  } catch (error) {
    console.error(error);
    return null;
  }
}

export default async function Page({ params }: Props) {
  const channel = await getChannelById(params.id);
  if (!channel) {
    return <div>Error fetching channel</div>;
  }

  const casts = await getChannelCasts(channel.url);
  if (!casts) {
    return <div>Error fetching casts</div>;
  }

  return (
    <div>
      <div className="fixed w-full top-0 right-0 mt-10 bg-gray-100">
        <ChannelNav />
      </div>
      <div className="pt-10">
        {" "}
        <CastsContainer casts={casts} />
      </div>
    </div>
  );
}
