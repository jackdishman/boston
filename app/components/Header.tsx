// components/Header.tsx
"use client";

import React from "react";
import { usePrivy, useLogin } from "@privy-io/react-auth";
import Menu from "./icons/Menu";
import X from "./icons/X";
import Connect from "./icons/Connect";
import Link from "next/link";
import { IEvent } from "@/types/interfaces";

interface HeaderProps {
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  clearSearch: () => void;
  closeSearch: () => void;
  isSearchActive: boolean;
}

const Header: React.FC<HeaderProps> = ({
  searchTerm,
  setSearchTerm,
  clearSearch,
  closeSearch,
  isSearchActive,
}) => {
  const { logout, ready, authenticated, getAccessToken, user } = usePrivy();

  const { login } = useLogin({
    onComplete: async (user, isNewUser, wasAlreadyAuthenticated) => {
      const accessToken = await getAccessToken();
      if (isNewUser) {
        fetch("/api/new-member", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const event: IEvent = {
          fid: user.farcaster?.fid ? user.farcaster.fid.toString() : "-1",
          display_name: user.farcaster?.username ?? "Unknown",
          action: "joined the platform",
        };
        fetch("/api/events", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ event }),
        });
        return;
      }
      if (!wasAlreadyAuthenticated) {
        const event: IEvent = {
          fid: user.farcaster?.fid ? user.farcaster.fid.toString() : "-1",
          display_name: user.farcaster?.username ?? "Unknown",
          action: "logged in",
        };
        fetch("/api/events", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ event }),
        });
      }
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const disableLogin = !ready || (ready && authenticated);

  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="fixed z-50 w-full bg-gray-100 shadow-md">
      <header className="flex justify-center items-center">
        <nav className="flex justify-between w-full max-w-7xl items-center h-16 px-4">
          <div className="flex-1 mx-4 relative">
            <input
              type="text"
              placeholder="🔎 Search channels or user"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-96 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              >
                ✖
              </button>
            )}
            {isSearchActive && (
              <button
                onClick={closeSearch}
                className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-500"
              >
                Close
              </button>
            )}
          </div>
          <div className="hidden md:flex space-x-6">
            {authenticated ? (
              <div className="flex space-x-4">
                <Link
                  href="/"
                  className="hover:underline flex items-center text-start"
                >
                  Home
                </Link>
                <Link
                  href="/quiz"
                  className="hover:underline flex items-center text-start"
                >
                  Trivia Quiz Frame
                </Link>
                <a
                  href="https://warpcast.com/~/add-cast-action?url=https%3A%2F%2Fdish.codes%2Fapi%2Factions%2Fbalance"
                  target="_blank"
                  className="hover:underline flex items-center text-start"
                >
                  Add Balance Cast Action
                </a>
                <button
                  onClick={logout}
                  className="hover:underline flex items-center text-start"
                >
                  <Connect />
                  <span className="ml-2">Disconnect</span>
                </button>
              </div>
            ) : (
              <button
                disabled={disableLogin}
                onClick={login}
                className="hover:underline flex items-center text-start"
              >
                <Connect />
                <span className="ml-2">Connect</span>
              </button>
            )}
          </div>
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>
        </nav>
      </header>
      {isOpen && (
        <div className="md:hidden absolute flex flex-col items-center bg-gray-100 shadow-lg w-full py-4 space-y-4 rounded-b-xl top-16 z-50">
          {authenticated ? (
            <div className="flex flex-col space-y-4">
              <Link
                href="/"
                onClick={() => setIsOpen(false)}
                className="hover:underline flex items-center text-start"
              >
                Home
              </Link>
              <Link
                href="/quiz"
                onClick={() => setIsOpen(false)}
                className="hover:underline flex items-center text-start"
              >
                Trivia Quiz Frame
              </Link>
              <a
                href="https://warpcast.com/~/add-cast-action?url=https%3A%2F%2Fdish.codes%2Fapi%2Factions%2Fbalance"
                target="_blank"
                className="hover:underline flex items-center text-start"
              >
                Add Balance Cast Action
              </a>
              <button
                onClick={logout}
                className="hover:underline flex items-center text-start"
              >
                <Connect />
                <span className="ml-2 w-32">Disconnect</span>
              </button>
            </div>
          ) : (
            <button
              disabled={disableLogin}
              onClick={login}
              className="hover:underline flex items-center text-start"
            >
              <Connect />
              <span className="ml-2 w-32">Connect</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Header;
