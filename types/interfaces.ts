export interface IChannelUsersResponse {
  fid: string;
  followedAt: string;
}

interface Bio {
  text: string;
}

interface UserProfile {
  bio: Bio;
}

interface VerifiedAddresses {
  eth_addresses: string[];
  sol_addresses: string[];
}

export interface INeynarUserResponse {
  object: "user";
  fid: number;
  custody_address: string;
  username: string;
  display_name: string;
  pfp_url: string;
  profile: UserProfile;
  follower_count: number;
  following_count: number;
  verifications: string[];
  verified_addresses: VerifiedAddresses;
  active_status: string;
  power_badge: boolean;
  followedAt: string;
}

export interface IChannelFollowersResponse {
  result: {
    users: IChannelUsersResponse[];
    fids: string[];
  };
  next: {
    cursor: string;
  };
}

export interface IChannelResponse {
  id: string;
  url: string;
  name: string;
  description: string;
  imageUrl: string;
  leadFid: number;
  hostFids: number[];
  createdAt: number;
  followerCount: number;
}

export interface IWarpcastChannelResult {
  channel: IChannelResponse;
}

export interface ApiResponse {
  result: IWarpcastChannelResult;
}

interface Profile {
  bio: Bio;
}

interface VerifiedAddress {
  eth_addresses: string[];
  sol_addresses: string[];
}

interface Author {
  object: string;
  fid: number;
  custody_address: string;
  username: string;
  display_name: string;
  pfp_url: string;
  profile: Profile;
  follower_count: number;
  following_count: number;
  verifications: string[];
  verified_addresses: VerifiedAddress;
  active_status: string;
  power_badge: boolean;
}

interface Like {
  fid: number;
  fname: string;
}

interface Recast {
  fid: number;
  fname: string;
}

interface Reaction {
  likes_count: number;
  recasts_count: number;
  likes: Like[];
  recasts: Recast[];
}

interface Reply {
  count: number;
}

interface Channel {
  object: string;
  id: string;
  name: string;
  image_url: string;
}

interface Embed {
  url: string;
}

export interface INeynarCastResponse {
  object: string;
  hash: string;
  thread_hash: string;
  parent_hash: string | null;
  parent_url: string;
  root_parent_url: string;
  parent_author: { fid: number | null };
  author: Author;
  text: string;
  timestamp: string;
  embeds: Embed[];
  reactions: Reaction;
  replies: Reply;
  channel: Channel;
  mentioned_profiles: []; // Adjust the type according to the structure of the mentioned_profiles array
}
