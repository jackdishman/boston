import {
  IChannelFollowersResponse,
  IChannelUsersResponse,
  INeynarUserResponse,
} from "@/types/interfaces";
import FollowersList from "./components/FollowersList";

export default async function Home() {
  const getChannelFids = async (nextCursor?: string | null) => {
    try {
      const response = await fetch(
        "https://api.warpcast.com/v1/channel-followers?channelId=boston"
      );
      const data: IChannelFollowersResponse = await response.json();
      const followers: IChannelUsersResponse[] = data.result.users.map(
        (item: IChannelUsersResponse) => {
          return {
            fid: item.fid,
            followedAt: item.followedAt,
          };
        }
      );
      const nextCursor = data.next.cursor;
      console.log(nextCursor);
      console.log(followers);
      return { followers, nextCursor };
    } catch (error) {
      console.error(error);
    }
  };

  const getUsersByFids = async (fids: string[]) => {
    try {
      const fidString = fids.join("%2C");
      const url =
        "https://api.neynar.com/v2/farcaster/user/bulk?fids=" + fidString;
      // url += `&viewer_fid=3`;
      const options = {
        method: "GET",
        headers: { accept: "application/json", api_key: "NEYNAR_API_DOCS" },
      };
      const response = await fetch(url, options);
      const data = await response.json();
      const users: INeynarUserResponse[] = data.users;
      return users;
    } catch (error) {
      console.error(error);
    }
  };

  const fetchData = async () => {
    let cursor: string | null | undefined = null;
    const users: INeynarUserResponse[] = [];
    const warpcastData = await getChannelFids(cursor);
    const followers = warpcastData?.followers;
    cursor = warpcastData?.nextCursor;
    if (!followers) return;
    const onlyFids = followers?.map((item) => item.fid);
    const res = await getUsersByFids(onlyFids);
    if (!res) return [];
    users.push(...res);
    return users;
  };

  const users = await fetchData();

  if (!users) return <div>Error fetching users</div>;

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold">Boston&apos;s Home!</h1>
      <section className="flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold">Followers</h2>
        <FollowersList users={users} />
      </section>
    </main>
  );
}
