import React from "react";
import {
  ApiResponse,
  IChannelResponse,
  INeynarCastResponse,
} from "@/types/interfaces";
import { NeynarAPIClient, FeedType, FilterType } from "@neynar/nodejs-sdk";
import CastsContainer from "./CastsContainer";

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

export default async function Page() {
  const channel = await getChannelById("boston");
  if (!channel) {
    return <div>Error fetching channel</div>;
  }

  const casts = await getChannelCasts(channel.url);
  if (!casts) {
    return <div>Error fetching casts</div>;
  }

  return <CastsContainer casts={casts} />;
}
