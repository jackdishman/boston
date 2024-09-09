"use client";
import React from "react";
import { getElapsedTimeString } from "@/middleware/quiz";
import { IEvent } from "@/types/interfaces";
import { getAccessToken } from "@privy-io/react-auth";
import Link from "next/link";

export default function RecentEvents() {
  const [events, setEvents] = React.useState<IEvent[]>();

  React.useEffect(() => {
    const fetchEvents = async () => {
      const accessToken = await getAccessToken();
      const res = await fetch("/api/events", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = await res.json();
      setEvents(data.events);
    };

    fetchEvents();
  }, []);

  const formatElapsedTime = (elapsedTime: string) => {
    const timeParts = elapsedTime.split(" ");
    const hourPart = timeParts[0].includes("h") ? parseInt(timeParts[0]) : 0;

    if (hourPart >= 24) {
      const days = Math.floor(hourPart / 24);
      return days === 1 ? `1 day ago` : `${days} days ago`;
    } else if (hourPart > 1) {
      return `${hourPart}h ago`;
    } else {
      return timeParts[0]; // e.g. "46m"
    }
  };

  const formatActionWithLink = (action: string) => {
    if (action.includes("searched for channel")) {
      const channel = action.split("searched for channel ")[1];
      return (
        <>
          searched for channel{" "}
          <Link href={`/channel${channel}`} className="underline">
            {channel}
          </Link>
        </>
      );
    } else if (action.includes("searched for user")) {
      const user = action.split("searched for user ")[1];
      const [userName, userId] =
        user.match(/(.+?) \((\d+)\)/)?.slice(1, 3) || [];
      return (
        <>
          searched for user{" "}
          <Link href={`/profile/${userId}`} className="underline">
            {userName} ({userId})
          </Link>
        </>
      );
    }
    return action;
  };

  if (!events) {
    return null;
  }

  return (
    <div className="h-full w-full overflow-y-scroll p-4">
      {events.map((event) => (
        <div key={event.id} className="mb-2">
          <p className="text-sm text-gray-700">
            <Link href={`/profile/${event.fid}`} className="underline">
              @{event.display_name}
            </Link>{" "}
            {formatActionWithLink(event.action)}{" "}
            {event.created_at &&
              formatElapsedTime(getElapsedTimeString(event.created_at))}
          </p>
        </div>
      ))}
    </div>
  );
}
