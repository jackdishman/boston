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

  if (!events) {
    return null;
  }

  return (
    <div className="h-full w-full overflow-y-scroll p-4 bg-gray-100 rounded-lg">
      {events.map((event) => (
        <div key={event.id} className="mb-2">
          <p className="text-sm text-gray-700">
            <Link href={`/fids/${event.fid}`} className="underline">
              @{event.display_name}
            </Link>{" "}
            {event.action} [
            {event.created_at &&
              getElapsedTimeString(event.created_at) + ` ago`}
            ]
          </p>
        </div>
      ))}
    </div>
  );
}
