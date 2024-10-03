"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import CalendarIcon from "@/app/components/icons/Calendar";
import CastIcon from "@/app/components/icons/Cast";
import MembersIcon from "@/app/components/icons/Members";

export default function ChannelNav() {
  const pathname = usePathname();
  const basePath = pathname.split("/").slice(0, 3).join("/");

  const navItems = [
    // { href: `${basePath}/followers`, label: "Followers", icon: <MembersIcon /> },
    { href: `${basePath}/members`, label: "Members", icon: <MembersIcon /> },
    { href: `${basePath}/events`, label: "Events", icon: <CalendarIcon /> },
    { href: `${basePath}/casts`, label: "Casts", icon: <CastIcon /> },
  ];

  return (
    <nav className="flex justify-around w-full py-5 border-b">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center px-4 py-2 rounded ${
              isActive
                  ? "text-blue-600 font-semibold border-b-2 border-blue-600"
                  : "text-gray-700 hover:text-blue-600"
              }`}
          >
            {item.icon}
            <span className="ml-2">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
