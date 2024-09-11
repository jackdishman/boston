"use client";

import Filter from "@/app/components/icons/Filter";
import { INeynarCastResponse } from "@/types/interfaces";
import React, { useState, useEffect, useRef } from "react";
import { usePrivy, getAccessToken } from "@privy-io/react-auth";
import { CastItem } from "./CastItem";
import { Sidebar } from "./Sidebar";

interface IProps {
  channelId: string;
}

export default function CastsContainer({ channelId }: IProps) {
  const { user } = usePrivy();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [casts, setCasts] = useState<INeynarCastResponse[]>([]);
  const [cursor, setCursor] = useState("");
  const [loading, setLoading] = useState(false);
  const [withReplies, setWithReplies] = useState(false);
  const [withRecasts, setWithRecasts] = useState(false);
  const [shouldModerate, setShouldModerate] = useState(false);
  const [error, setError] = useState("");
  const [topCasters, setTopCasters] = useState<
    { username: string; displayName: string; score: number; fid: number }[]
  >([]);
  const [expandedReplies, setExpandedReplies] = useState<{
    [key: string]: boolean;
  }>({});
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const fetchCasts = async (
    cursor = "",
    withReplies = false,
    withRecasts = false,
    shouldModerate = false
  ) => {
    if (loading) return; // Prevent duplicate requests
    setLoading(true);
    const accessToken = await getAccessToken();
    try {
      const body = JSON.stringify({
        channelId,
        withReplies,
        withRecasts,
        shouldModerate,
        viewerFid: user?.farcaster?.fid,
        cursor, // Include cursor for pagination
      });
      const response = await fetch(`/api/fetch-channel-feed`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body,
      });

      const data = await response.json();

      if (data.casts && data.casts.length > 0) {
        setCasts((prevCasts) => {
          const existingHashes = new Set(prevCasts.map((cast) => cast.hash));
          const newCasts = data.casts.filter(
            (cast: { hash: string }) => !existingHashes.has(cast.hash)
          );
          return [...prevCasts, ...newCasts];
        });
        setCursor(data.cursor);
      } else {
        setCursor("");
      }
    } catch (error) {
      setError("Error fetching casts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCasts([]);
    setCursor("");
    fetchCasts("", withReplies, withRecasts, shouldModerate);
  }, [withReplies, withRecasts, shouldModerate]);

  const handleFetchMore = () => {
    if (!loading && cursor) {
      fetchCasts(cursor, withReplies, withRecasts, shouldModerate);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && cursor) {
          handleFetchMore();
        }
      },
      {
        root: null,
        rootMargin: "20px",
        threshold: 1.0,
      }
    );

    if (bottomRef.current) {
      observer.observe(bottomRef.current);
    }

    return () => {
      if (bottomRef.current) {
        observer.disconnect();
      }
    };
  }, [cursor]);

  useEffect(() => {
    calculateTopCasters();
  }, [casts]);

  const calculateTopCasters = () => {
    const casterScores: {
      [key: string]: { displayName: string; score: number; fid: number };
    } = {};
    casts.forEach((cast) => {
      const score =
        cast.reactions.likes_count + cast.reactions.recasts_count * 2;
      const username = cast.author.username;
      const displayName = cast.author.display_name;
      const fid = cast.author.fid;
      casterScores[username] = casterScores[username]
        ? {
            ...casterScores[username],
            score: casterScores[username].score + score,
          }
        : { displayName, score, fid };
    });
    const sortedCasters = Object.entries(casterScores)
      .map(([username, { displayName, score, fid }]) => ({
        username,
        displayName,
        score,
        fid,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
    setTopCasters(sortedCasters);
  };

  // New logic to map casts to their parent
  const mapCastsToParents = (casts: INeynarCastResponse[]) => {
    const rootCasts: INeynarCastResponse[] = [];
    const repliesMap: { [key: string]: INeynarCastResponse[] } = {};

    casts.forEach((cast) => {
      if (!cast.parent_hash) {
        rootCasts.push(cast);
      } else {
        if (!repliesMap[cast.parent_hash]) {
          repliesMap[cast.parent_hash] = [];
        }
        repliesMap[cast.parent_hash].push(cast);
      }
    });

    return { rootCasts, repliesMap };
  };

  const toggleExpanded = (castHash: string) => {
    setExpandedReplies((prevExpanded) => ({
      ...prevExpanded,
      [castHash]: !prevExpanded[castHash],
    }));
  };

  const renderCastsWithReplies = (
    cast: INeynarCastResponse,
    repliesMap: { [key: string]: INeynarCastResponse[] },
    depth = 0
  ) => {
    const isExpanded = expandedReplies[cast.hash] || false;

    return (
      <div
        key={cast.hash}
        style={{ marginLeft: depth * 20, position: "relative" }}
      >
        <div className="reply-line" style={{ left: depth * 20 }} />
        <CastItem cast={cast} />
        {repliesMap[cast.hash] && repliesMap[cast.hash].length > 0 && (
          <div>
            <button
              onClick={() => toggleExpanded(cast.hash)}
              className="text-blue-500 underline mt-2"
            >
              {isExpanded
                ? "Collapse Replies"
                : `View ${repliesMap[cast.hash].length} Replies`}
            </button>
            {isExpanded &&
              repliesMap[cast.hash].map((reply) =>
                renderCastsWithReplies(reply, repliesMap, depth + 1)
              )}
          </div>
        )}
      </div>
    );
  };

  const { rootCasts, repliesMap } = mapCastsToParents(casts);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar
        withReplies={withReplies}
        withRecasts={withRecasts}
        shouldModerate={shouldModerate}
        setWithReplies={setWithReplies}
        setWithRecasts={setWithRecasts}
        setShouldModerate={setShouldModerate}
        topCasters={topCasters}
      />

      {/* Mobile Filter Button */}
      <button
        onClick={() => setIsFilterOpen(!isFilterOpen)}
        className="fixed bottom-4 left-4 bg-blue-500 text-white p-2 rounded-full z-40 lg:hidden"
      >
        <Filter />
      </button>

      {/* Main Content */}
      <div className="w-full lg:w-3/4 lg:ml-auto lg:pl-4 pt-20 lg:pt-0 space-y-4 p-4">
        {rootCasts.length > 0 ? (
          rootCasts.map((cast) => renderCastsWithReplies(cast, repliesMap))
        ) : (
          <div className="text-center text-gray-500">No casts available</div>
        )}

        {/* Fetch More Button */}
        <div className="text-center">
          {cursor && !loading && (
            <button
              onClick={handleFetchMore}
              className="bg-blue-500 text-white py-2 px-4 rounded"
              disabled={loading || !cursor}
            >
              Fetch More Casts
            </button>
          )}
        </div>

        {/* Invisible div for triggering infinite scroll */}
        <div ref={bottomRef} className="h-10"></div>
      </div>
    </div>
  );
}
