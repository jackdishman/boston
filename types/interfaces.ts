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
