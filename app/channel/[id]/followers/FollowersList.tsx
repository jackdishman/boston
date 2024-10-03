// FollowersList.tsx
"use client";

import React, { useState, useEffect } from "react";
import { INeynarUserResponse } from "@/types/interfaces";
import ProfilePreview from "../ProfilePreview";
import ProgressBar from "@/app/components/ProgressBar";
import { getAccessToken } from "@privy-io/react-auth";
import UserFilter from "@/app/channel/UserFilter";
import { useDebounce } from "use-debounce";

interface IFollowersListProps {
  users: INeynarUserResponse[];
  cursor: string | null;
  channelId: string;
  followerCount: number;
}

const FollowersList: React.FC<IFollowersListProps> = ({
  users,
  cursor,
  channelId,
  followerCount,
}) => {
  const [sortOption, setSortOption] = useState<string>("followersCountDesc");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearchQuery] = useDebounce(searchQuery.trim(), 300);
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [displayedUsers, setDisplayedUsers] = useState<INeynarUserResponse[]>(users);
  const [nextCursor, setNextCursor] = useState<string | null>(cursor);
  const [allUsers, setAllUsers] = useState<INeynarUserResponse[]>(users);

  const MAX_FETCHED_USERS = 1000;

  // Logic to fetch more users
  const fetchMoreUsers = async () => {
    setLoading(true);
    const accessToken = await getAccessToken();
    try {
      const response = await fetch(`/api/fetch-more-channel-followers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          channelId,
          cursor: nextCursor,
        }),
      });
      const data = await response.json();
      const fetchedUsers = data.users.users as INeynarUserResponse[];
      const cursor = data.cursor;
      return { users: fetchedUsers, cursor };
    } catch (error) {
      console.error("Error fetching more users:", error);
    } finally {
      setLoading(false);
    }
  };

  // Logic to sort and filter users
  useEffect(() => {
    let sorted = [...allUsers];

    if (sortOption === "alphabeticalAsc") {
      sorted.sort((a, b) =>
        (a.display_name || "").localeCompare(b.display_name || "")
      );
    } else if (sortOption === "alphabeticalDesc") {
      sorted.sort((a, b) =>
        (b.display_name || "").localeCompare(a.display_name || "")
      );
    } else if (sortOption === "followersCountAsc") {
      sorted.sort((a, b) => a.follower_count - b.follower_count);
    } else if (sortOption === "followersCountDesc") {
      sorted.sort((a, b) => b.follower_count - a.follower_count);
    }

    if (debouncedSearchQuery !== "") {
      sorted = sorted.filter(
        (user) =>
          (user.username &&
            user.username
              .toLowerCase()
              .includes(debouncedSearchQuery.toLowerCase())) ||
          (user.display_name &&
            user.display_name
              .toLowerCase()
              .includes(debouncedSearchQuery.toLowerCase()))
      );
    }

    setDisplayedUsers(sorted);
  }, [sortOption, debouncedSearchQuery, allUsers]);

  useEffect(() => {
    const fetchUsers = async () => {
      if (nextCursor && allUsers.length < MAX_FETCHED_USERS) {
        const res = await fetchMoreUsers();
        if (!res || !Array.isArray(res.users)) {
          console.error("No users found or invalid response:", res);
          return;
        }
        const { users: fetchedUsers, cursor } = res;

        // Filter out any users already in allUsers by comparing their fid
        setAllUsers((prevUsers) => {
          const newUsers = fetchedUsers.filter(
            (newUser) => !prevUsers.some((prevUser) => prevUser.fid === newUser.fid)
          );

          // Ensure we don't go over the limit
          const updatedUsers = [...prevUsers, ...newUsers];
          return updatedUsers.slice(0, MAX_FETCHED_USERS);
        });

        // Update the cursor
        if (allUsers.length + fetchedUsers.length >= MAX_FETCHED_USERS) {
          setNextCursor(null);
        } else {
          setNextCursor(cursor);
        }
      }
    };

    fetchUsers();
  }, [nextCursor, allUsers.length]);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      <UserFilter
        sortOption={sortOption}
        setSortOption={setSortOption}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isFilterOpen={isFilterOpen}
        setIsFilterOpen={setIsFilterOpen}
      />

      {/* Main Content */}
      <div className="w-full lg:w-3/4 lg:ml-auto lg:pl-4 pt-20 lg:pt-0">
        <ProgressBar loaded={displayedUsers.length} total={followerCount} />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-8 p-4">
          {displayedUsers.map((user) => (
            <ProfilePreview key={user.fid} user={user} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FollowersList;
