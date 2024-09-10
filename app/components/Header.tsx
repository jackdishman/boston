// components/Header.tsx
"use client";

import React from "react";
import { usePrivy } from "@privy-io/react-auth";
import Menu from "./icons/Menu";
import X from "./icons/X";
import Power from "./icons/Power";
import Link from "next/link";
import { IEvent } from "@/types/interfaces";
import Home from "./icons/Home";
import DocumentText from "./icons/DocumentText";
import SquarePlus from "./icons/SquarePlus";

interface HeaderProps {
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  clearSearch: () => void;
  closeSearch: () => void;
  isSearchActive: boolean;
  login: () => void;
}

const Header: React.FC<HeaderProps> = ({
  searchTerm,
  setSearchTerm,
  clearSearch,
  closeSearch,
  isSearchActive,
  login,
}) => {
  const { logout, ready, authenticated } = usePrivy();

  const disableLogin = !ready || (ready && authenticated);

  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="fixed z-50 w-full bg-gray-100 shadow-md">
      <header className="flex justify-center items-center">
        <nav className="flex justify-between w-full max-w-7xl items-center h-16 px-4">
          <div className="flex-1 mx-4 relative">
            <input
              type="text"
              placeholder="🔎 Search channels or Farcaster Profile"
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
                  className="hover:bg-white hover:shadow flex items-center text-start rounded-lg p-2"
                >
                  <Home />
                  <span className="ml-2">Home</span>
                </Link>
                <Link
                  href="/quiz"
                  className="hover:bg-white hover:shadow flex items-center text-start rounded-lg p-2"
                >
                  <DocumentText />
                  <span className="ml-2">Trivia Quiz</span>
                </Link>
                <a
                  href="https://warpcast.com/~/add-cast-action?url=https%3A%2F%2Fdish.codes%2Fapi%2Factions%2Fbalance"
                  target="_blank"
                  className="hover:bg-white hover:shadow flex items-center text-start rounded-lg p-2"
                >
                  <SquarePlus />
                  <span className="ml-2">Balance Action</span>
                </a>
                <button
                  onClick={logout}
                  className="hover:bg-white hover:shadow flex items-center text-start rounded-lg p-2"
                >
                  <Power />
                  <span className="ml-2">Disconnect</span>
                </button>
              </div>
            ) : (
              <button
                disabled={disableLogin}
                onClick={login}
                className="hover:underline flex items-center text-start"
              >
                <Power />
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
          {authenticated && (
            <div className="flex flex-col space-y-4">
              <Link
                href="/"
                onClick={() => setIsOpen(false)}
                className="bg-white hover:shadow flex items-center text-start rounded-lg p-2"
              >
                <Home />
                <span className="ml-2">Home</span>
              </Link>
              <Link
                href="/quiz"
                onClick={() => setIsOpen(false)}
                className="bg-white hover:shadow flex items-center text-start rounded-lg p-2"
              >
                Trivia Quiz Frame
              </Link>
              <a
                href="https://warpcast.com/~/add-cast-action?url=https%3A%2F%2Fdish.codes%2Fapi%2Factions%2Fbalance"
                target="_blank"
                className="bg-white hover:shadow flex items-center text-start rounded-lg p-2"
              >
                <SquarePlus />
                <span className="ml-2">Balance Action</span>
              </a>
              <button
                onClick={logout}
                className="bg-white hover:shadow flex items-center text-start rounded-lg p-2"
              >
                <Power />
                <span className="ml-2 w-32">Disconnect</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Header;
