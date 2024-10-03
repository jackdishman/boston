// MembersList.tsx
"use client";

import React, { useState, useEffect } from "react";
import { INeynarChannelMemberResponse } from "@/types/interfaces";
import ProfilePreview from "../ProfilePreview";
import { getAccessToken } from "@privy-io/react-auth";
import UserFilter from "@/app/channel/UserFilter";
import { useDebounce } from "use-debounce";
import ProgressBar from "@/app/components/ProgressBar";

interface IMembersListProps {
  users: INeynarChannelMemberResponse[];
  cursor: string | null;
  channelId: string;
}

const MembersList: React.FC<IMembersListProps> = ({
  users,
  cursor,
  channelId,
}) => {
  const [sortOption, setSortOption] = useState<string>("followersCountDesc");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearchQuery] = useDebounce(searchQuery.trim(), 300);
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [displayedUsers, setDisplayedUsers] = useState<
    INeynarChannelMemberResponse[]
  >(users);
  const [nextCursor, setNextCursor] = useState<string | null>(cursor);
  const [allUsers, setAllUsers] = useState<INeynarChannelMemberResponse[]>(users);

  const MAX_FETCHED_USERS = 1000;

  // Logic to fetch more members
  const fetchMoreMembers = async () => {
    setLoading(true);
    const accessToken = await getAccessToken();
    try {
      const response = await fetch(`/api/fetch-more-channel-members`, {
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
      const fetchedUsers = data.users as INeynarChannelMemberResponse[];
      const cursor = data.cursor;
      return { users: fetchedUsers, cursor };
    } catch (error) {
      console.error("Error fetching more users:", error);
    } finally {
      setLoading(false);
    }
  };

  // Logic to sort and filter members
  useEffect(() => {
    let sorted = [...allUsers];

    if (sortOption === "alphabeticalAsc") {
      sorted.sort((a, b) =>
        (a.user.display_name || "").localeCompare(b.user.display_name || "")
      );
    } else if (sortOption === "alphabeticalDesc") {
      sorted.sort((a, b) =>
        (b.user.display_name || "").localeCompare(a.user.display_name || "")
      );
    } else if (sortOption === "followersCountAsc") {
      sorted.sort((a, b) => a.user.follower_count - b.user.follower_count);
    } else if (sortOption === "followersCountDesc") {
      sorted.sort((a, b) => b.user.follower_count - a.user.follower_count);
    }

    if (debouncedSearchQuery !== "") {
      sorted = sorted.filter(
        (member) =>
          (member.user.username &&
            member.user.username
              .toLowerCase()
              .includes(debouncedSearchQuery.toLowerCase())) ||
          (member.user.display_name &&
            member.user.display_name
              .toLowerCase()
              .includes(debouncedSearchQuery.toLowerCase()))
      );
    }

    setDisplayedUsers(sorted);
  }, [sortOption, debouncedSearchQuery, allUsers]);

  useEffect(() => {
    const fetchUsers = async () => {
      if (nextCursor && allUsers.length < MAX_FETCHED_USERS) {
        const res = await fetchMoreMembers();
        if (!res || !Array.isArray(res.users)) {
          console.error("No users found or invalid response:", res);
          return;
        }
        const { users: fetchedUsers, cursor } = res;

        // Filter out any users already in allUsers by comparing their fid
        setAllUsers((prevUsers) => {
          const newUsers = fetchedUsers.filter(
            (newUser) =>
              !prevUsers.some(
                (prevUser) => prevUser.user.fid === newUser.user.fid
              )
          );

          // Ensure we don't exceed the limit
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
      <ProgressBar loaded={displayedUsers.length} total={displayedUsers.length} />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-8 p-4">
          {displayedUsers.map((member) => (
            <ProfilePreview key={member.user.fid} user={member.user} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MembersList;
