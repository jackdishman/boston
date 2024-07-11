import {
  ApiResponse,
  IChannelFollowersResponse,
  IChannelResponse,
  IChannelUsersResponse,
  INeynarUserResponse,
} from "@/types/interfaces";

const fetchWithRetry = async (
  url: string,
  options: RequestInit,
  retries = 3
): Promise<Response> => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok && attempt < retries) {
        continue;
      }
      return response;
    } catch (error) {
      if (attempt === retries) {
        throw error;
      }
    }
  }
  throw new Error("Max retries reached");
};

export const getAllChannels = async (
  isServer = false
): Promise<IChannelResponse[]> => {
  try {
    const url = isServer
      ? "https://api.warpcast.com/v2/all-channels"
      : "/api/channels";
    const response = await fetchWithRetry(url, { method: "GET" });
    const data = await response.json();
    const { channels } = data.result;
    return channels as IChannelResponse[];
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const getChannelById = async (
  id: string
): Promise<IChannelResponse | null> => {
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
};

export const getChannelFids = async (
  channelId: string,
  nextCursor?: string | null,
  limit: number = 50
): Promise<{
  followers: IChannelUsersResponse[];
  nextCursor: string | null;
}> => {
  try {
    const url = `https://api.warpcast.com/v1/channel-followers?channelId=${channelId}${
      nextCursor ? `&cursor=${nextCursor}` : ""
    }&limit=${limit}`;
    const response = await fetchWithRetry(url, { method: "GET" });
    const data: IChannelFollowersResponse = await response.json();
    const followers: IChannelUsersResponse[] = data.result.users.map(
      (item) => ({
        fid: item.fid,
        followedAt: item.followedAt,
      })
    );
    return { followers, nextCursor: data.next?.cursor || null };
  } catch (error) {
    console.error(error);
    return { followers: [], nextCursor: null };
  }
};

export const getUsersByFids = async (
  fids: string[]
): Promise<INeynarUserResponse[]> => {
  try {
    const fidString = fids.join("%2C");
    const url = `https://api.neynar.com/v2/farcaster/user/bulk?fids=${fidString}`;
    const options = {
      method: "GET",
      headers: {
        accept: "application/json",
        api_key: process.env.NEYNAR_API_KEY ?? ``,
      },
    };
    const response = await fetchWithRetry(url, options);
    const data = await response.json();
    return data.users as INeynarUserResponse[];
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const fetchChannelFollowerFids = async (
  channelId: string
): Promise<IChannelUsersResponse[]> => {
  let cursor: string | null = null;
  const allFollowers: IChannelUsersResponse[] = [];

  do {
    const { followers, nextCursor } = await getChannelFids(channelId, cursor);
    allFollowers.push(...followers);
    cursor = nextCursor;
  } while (cursor);

  return allFollowers;
};

export function splitIntoBatches(
  array: IChannelUsersResponse[],
  batchSize: number
): IChannelUsersResponse[][] {
  const batches = [];
  for (let i = 0; i < array.length; i += batchSize) {
    const batch = array.slice(i, i + batchSize);
    batches.push(batch);
  }
  return batches;
}
