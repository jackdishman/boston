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
  viewer_context?: {
    liked: boolean;
    recasted: boolean;
  };
}

export interface IBalanceResponse extends Array<TokenBalance> {}

export type TokenBalance = {
  chainId: string;
  chainName: "ethereum" | "base";
  contractAddress: string | null;
  name: string;
  symbol: string;
  balance: number;
};

interface IcebreakerProfileChannel {
  type: string;
  isVerified: boolean;
  isLocked: boolean;
  value: string;
  url: string;
}

interface IcebreakerProfileCredential {
  name: string;
  chain: string;
  source: string;
  reference: string;
}

interface IcebreakerProfileHighlight {
  title: string;
  url: string;
}

interface IcebreakerProfileWorkExperience {
  jobTitle: string;
  orgWebsite: string;
  employmentType: string;
  location: string;
  startDate: string;
  endDate: string | null;
}

export interface IIcebreakerProfile {
  profileID: string;
  walletAddress: string;
  avatarUrl: string;
  displayName: string;
  bio: string;
  jobTitle: string;
  primarySkill: string;
  networkingStatus: string;
  location: string;
  channels: IcebreakerProfileChannel[];
  credentials: IcebreakerProfileCredential[];
  highlights: IcebreakerProfileHighlight[]; // Updated to reflect the data structure for highlights
  workExperience: IcebreakerProfileWorkExperience[]; // Updated to reflect the data structure for workExperience
}

export interface IIcebreakerProfilesResponse {
  profiles: IIcebreakerProfile[];
}

export interface IEvent {
  id?: number;
  created_at?: string;
  fid: string;
  display_name: string;
  action: string;
}

export interface INFTResponse {
  ownedNfts: OwnedNft[];
  pageKey: string;
  totalCount: number;
  blockHash: string;
}

export interface OwnedNft {
  contract: Contract;
  id: NFTId;
  balance: string;
  title: string;
  description: string;
  tokenUri: TokenUri;
  media: Media[];
  metadata: Metadata;
  timeLastUpdated: string;
  contractMetadata: ContractMetadata;
  spamInfo?: SpamInfo;
}

export interface Contract {
  address: string;
}

export interface NFTId {
  tokenId: string;
  tokenMetadata: TokenMetadata;
}

export interface TokenMetadata {
  tokenType: string;
}

export interface TokenUri {
  gateway: string;
  raw: string;
}

export interface Media {
  gateway: string;
  thumbnail?: string;
  raw: string;
  format?: string;
  bytes?: number;
}

export interface Metadata {
  background_image?: string;
  image?: string;
  external_url?: string;
  is_normalized?: boolean;
  image_url?: string;
  name?: string;
  description?: string;
  attributes?: Attribute[];
  version?: number;
  url?: string;
}

export interface Attribute {
  value: string | number | boolean;
  trait_type: string;
  display_type?: string;
}

export interface ContractMetadata {
  name: string;
  symbol: string;
  tokenType: string;
  contractDeployer: string;
  deployedBlockNumber: number;
  openSea: OpenSeaMetadata;
}

export interface OpenSeaMetadata {
  floorPrice: number;
  collectionName: string;
  collectionSlug: string;
  safelistRequestStatus: string;
  imageUrl: string;
  bannerImageUrl?: string;
  description: string;
  lastIngestedAt: string;
}

export interface SpamInfo {
  isSpam: string;
  classifications: string[];
}

export interface IAddressBalance {
  address: string;
  balances: IBalanceResponse;
}

export interface INFTs {
  address: string;
  ethereumNFTs: OwnedNft[];
  baseNFTs: OwnedNft[];
}

export interface EventStats {
  channel_id: string;
  total_stats: {
    num_events: number;
    num_rsvps: number;
    num_shares: number;
    num_likes: number;
    num_recasts: number;
  };
  by_month: {
    july: MonthlyStats;
    august: MonthlyStats;
    september: MonthlyStats;
  };
  leaderboard: LeaderboardEntry[];
}

export interface MonthlyStats {
  num_shares: number;
  num_likes: number;
  num_recasts: number;
  num_rsvps: number;
}

export interface LeaderboardEntry {
  username: string;
  user_likes: number;
  user_recasts: number;
  user_shares: number;
}
