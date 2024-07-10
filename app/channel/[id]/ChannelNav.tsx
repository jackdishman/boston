// components/ChannelNav.tsx
"use client";

import Calendar from "@/app/components/icons/Calendar";
import Cast from "@/app/components/icons/Cast";
import Members from "@/app/components/icons/Members";
import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation";

export default function ChannelNav() {
  const pathname = usePathname().split("/").slice(0, 3).join("/");
  return (
    <div className="flex justify-around w-full py-5">
      <Link
        href={`${pathname}/members`}
        className="hover:underline flex items-center"
      >
        <Members />
        <span className="ml-2">Members</span>
      </Link>
      <Link
        href={`${pathname}/events`}
        className="hover:underline flex items-center"
      >
        <Calendar />
        <span className="ml-2">Events</span>
      </Link>
      <Link
        href={`${pathname}/casts`}
        className="hover:underline flex items-center"
      >
        <Cast />
        <span className="ml-2">Casts</span>
      </Link>
    </div>
  );
}
