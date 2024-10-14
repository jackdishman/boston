import {
  ApiResponse,
  IIcebreakerProfilesResponse,
  IChannelResponse,
  INeynarUserResponse,
  INeynarCastResponse,
  INeynarChannelMemberResponse,
  INeynarChannelMemberDetailedResponse,
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

export const getChannelFollowers = async (
  channelId: string,
  cursor?: string | null,
  limit: number = 100
): Promise<{ users: INeynarUserResponse[]; cursor: string }> => {
  const url = `https://api.neynar.com/v2/farcaster/channel/followers?id=${channelId}${
    cursor ? `&cursor=${cursor}` : ""
  }&limit=${limit}`;
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      api_key: process.env.NEYNAR_API_KEY ?? ``,
    },
  };
  const response = await fetchWithRetry(url, options);
  const data = await response.json();
  const { users, next } = data;
  if (!users) {
    return { users: [], cursor: "" };
  }
  return { users, cursor: next?.cursor || "" };
};

export const getChannelMembers = async (
  channelId: string,
  cursor?: string | null,
  limit: number = 100
): Promise<{ users: INeynarChannelMemberResponse[]; cursor: string }> => {
  const url = `https://api.neynar.com/v2/farcaster/channel/member/list?channel_id=${channelId}`;
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      api_key: process.env.NEYNAR_API_KEY ?? ``,
    },
  };
  const response = await fetchWithRetry(url, options);
  const data = await response.json();
  const { members, next } = data;
  if (!members) {
    return { users: [], cursor: "" };
  }
  return { users: members, cursor: next?.cursor || "" };
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
    if (!data || !data.users) {
      return [];
    }
    return data.users as INeynarUserResponse[];
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const getUsersByName = async (
  search: string
): Promise<INeynarUserResponse[]> => {
  try {
    const url = `https://api.neynar.com/v2/farcaster/user/search?q=${search}&limt=5`;
    const options = {
      method: "GET",
      headers: {
        accept: "application/json",
        api_key: process.env.NEYNAR_API_KEY ?? ``,
      },
    };
    const response = await fetchWithRetry(url, options);
    const { result } = await response.json();
    if (!result || !result.users) {
      return [];
    }
    return result.users as INeynarUserResponse[];
  } catch (error) {
    console.error(error);
    return [];
  }
};

export async function getIcebreakerProfile(
  fid: string
): Promise<IIcebreakerProfilesResponse | null> {
  try {
    const res = await fetch(`https://app.icebreaker.xyz/api/v1/fid/${fid}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();
    return data;
  } catch {
    return null;
  }
}

export async function getChannelFeed(
  channel_id: string,
  with_recasts?: boolean,
  viewer_fid?: number,
  with_replies?: boolean,
  limit?: number,
  cursor?: string,
  should_moderate?: boolean
): Promise<{ casts: INeynarCastResponse[]; cursor: string }> {
  // Construct the base URL
  let url = `https://api.neynar.com/v2/farcaster/feed/channels?channel_ids=${channel_id}`;

  // Conditionally append query parameters if they are present
  if (with_recasts !== undefined) url += `&with_recasts=${with_recasts}`;
  if (with_replies !== undefined) url += `&with_replies=${with_replies}`;
  if (limit !== undefined) url += `&limit=${limit}`;
  if (cursor) url += `&cursor=${cursor}`;
  if (viewer_fid !== undefined) url += `&viewer_fid=${viewer_fid}`;
  if (should_moderate !== undefined)
    url += `&should_moderate=${should_moderate}`;

  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      api_key: process.env.NEYNAR_API_KEY ?? ``,
    },
  };

  const response = await fetchWithRetry(url, options);
  const data = await response.json();
  return { casts: data.casts, cursor: data.next?.cursor || "" };
}

export const getUserByEthAddress = async (
  address: string
): Promise<Record<string, INeynarUserResponse>[] | null> => {
  try {
    const url = `https://api.neynar.com/v2/farcaster/user/bulk-by-address?addresses=${address}`;
    const options = {
      method: "GET",
      headers: {
        accept: "application/json",
        api_key: process.env.NEYNAR_API_KEY ?? ``,
      },
    };
    const response = await fetchWithRetry(url, options);
    const data = await response.json();
    return data as Record<string, INeynarUserResponse>[];
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getChannelMemberships = async (
  fid: string,
  cursor?: string
): Promise<{ members: INeynarChannelMemberDetailedResponse[], next_cursor: string | null }> => {
  try {
    let url = `https://api.neynar.com/v2/farcaster/user/memberships/list?fid=${fid}&limit=100`;
    if (cursor) {
      url += `&cursor=${cursor}`;
    }
    const options = {
      method: "GET",
      headers: {
        accept: "application/json",
        api_key: process.env.NEYNAR_API_KEY ?? ``,
      },
    };
    const response = await fetchWithRetry(url, options);
    const data = await response.json();
    return {
      members: data.members,
      next_cursor: data.next?.cursor || null
    };
  } catch (error) {
    console.error(error);
    return { members: [], next_cursor: null };
  }
};
