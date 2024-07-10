import {
  ApiResponse,
  IChannelFollowersResponse,
  IChannelResponse,
  IChannelUsersResponse,
  INeynarUserResponse,
} from "@/types/interfaces";

export const getChannelFids = async (
  channelId: string,
  nextCursor?: string | null
): Promise<{
  followers: IChannelUsersResponse[];
  nextCursor: string | null;
}> => {
  try {
    const response = await fetch(
      `https://api.warpcast.com/v1/channel-followers?channelId=${channelId}${
        nextCursor ? `&cursor=${nextCursor}` : ""
      }`
    );
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
    const response = await fetch(url, options);
    const data = await response.json();
    return data.users as INeynarUserResponse[];
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const getAllChannels = async (
  isServer = false
): Promise<IChannelResponse[]> => {
  try {
    const url = isServer
      ? "https://api.warpcast.com/v2/all-channels"
      : "/api/channels";
    const response = await fetch(url);
    const data = await response.json();
    const { channels } = data.result;
    return channels as IChannelResponse[];
  } catch (error) {
    console.error(error);
    return [];
  }
};

export async function getChannelById(
  id: string
): Promise<IChannelResponse | null> {
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
