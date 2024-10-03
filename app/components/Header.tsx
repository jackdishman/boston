// components/Header.tsx
"use client";

import React from "react";
import { usePrivy } from "@privy-io/react-auth";
import Menu from "./icons/Menu";
import X from "./icons/X";
import Power from "./icons/Power";
import Link from "next/link";
import Home from "./icons/Home";
import DocumentText from "./icons/DocumentText";
import SquarePlus from "./icons/SquarePlus";
import { useState, useRef, useEffect } from "react";
import ChevronDown from "./icons/ChevronDown";
import CurrencyDollar from "./icons/Currency"; // You'll need to create this icon component

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

  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isFeatureDropdownOpen, setIsFeatureDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const featureDropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (featureDropdownRef.current && !featureDropdownRef.current.contains(event.target as Node)) {
        setIsFeatureDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleActionClick = () => {
    setIsDropdownOpen(false);
    setIsFeatureDropdownOpen(false);
    setIsOpen(false);
  };

  return (
    <div className="fixed z-50 w-full bg-gray-100 shadow-md">
      <header className="flex justify-center items-center">
        <nav className="flex justify-between w-full max-w-7xl items-center h-16 px-4">
          <div className="flex-1 mx-4 relative">
            <input
              type="text"
              placeholder="🔎 Search Farcaster Channels, Profiles, or Ethereum Addresses"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <div className="relative" ref={featureDropdownRef}>
                  <button
                    onClick={() => setIsFeatureDropdownOpen(!isFeatureDropdownOpen)}
                    className="hover:bg-white hover:shadow flex items-center text-start rounded-lg p-2"
                  >
                    <DocumentText />
                    <span className="ml-2">Features</span>
                    <ChevronDown className="ml-1" />
                  </button>
                  {isFeatureDropdownOpen && (
                    <div className="absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                      <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                        <Link
                          href="/quiz"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          role="menuitem"
                          onClick={handleActionClick}
                        >
                          Quiz
                        </Link>
                        <Link
                          href="/crowdfund"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          role="menuitem"
                          onClick={handleActionClick}
                        >
                          Crowdfund
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="hover:bg-white hover:shadow flex items-center text-start rounded-lg p-2"
                  >
                    <SquarePlus />
                    <span className="ml-2">Actions</span>
                    <ChevronDown className="ml-1" />
                  </button>
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                      <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                        <a
                          href="https://warpcast.com/~/add-cast-action?url=https%3A%2F%2Fdish.codes%2Fapi%2Factions%2Flegitness"
                          target="_blank"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          role="menuitem"
                          onClick={handleActionClick}
                        >
                          Icebreaker Action
                        </a>
                        <a
                          href="https://warpcast.com/~/add-cast-action?url=https%3A%2F%2Fdish.codes%2Fapi%2Factions%2Fbalance"
                          target="_blank"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          role="menuitem"
                          onClick={handleActionClick}
                        >
                          Balance Action
                        </a>
                      </div>
                    </div>
                  )}
                </div>
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
        <div ref={mobileMenuRef} className="md:hidden absolute flex flex-col items-center bg-gray-100 shadow-lg w-full py-4 space-y-4 rounded-b-xl top-16 z-50">
          {authenticated && (
            <div className="flex flex-col space-y-4">
              <Link
                href="/"
                onClick={handleActionClick}
                className="bg-white hover:shadow flex items-center text-start rounded-lg p-2"
              >
                <Home />
                <span className="ml-2">Home</span>
              </Link>
              <div className="relative w-full" ref={featureDropdownRef}>
                <button
                  onClick={() => setIsFeatureDropdownOpen(!isFeatureDropdownOpen)}
                  className="bg-white hover:shadow flex items-center text-start rounded-lg p-2 w-full"
                >
                  <DocumentText />
                  <span className="ml-2">Features</span>
                  <ChevronDown className="ml-auto" />
                </button>
                {isFeatureDropdownOpen && (
                  <div className="mt-2 w-full rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                    <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                      <Link
                        href="/quiz"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        role="menuitem"
                        onClick={handleActionClick}
                      >
                        Quiz
                      </Link>
                      <Link
                        href="/crowdfund"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        role="menuitem"
                        onClick={handleActionClick}
                      >
                        Crowdfund
                      </Link>
                    </div>
                  </div>
                )}
              </div>
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="bg-white hover:shadow flex items-center text-start rounded-lg p-2 w-full"
                >
                  <SquarePlus />
                  <span className="ml-2">Actions</span>
                  <ChevronDown className="ml-auto" />
                </button>
                {isDropdownOpen && (
                  <div className="mt-2 w-full rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                    <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                      <a
                        href="https://warpcast.com/~/add-cast-action?url=https%3A%2F%2Fdish.codes%2Fapi%2Factions%2Flegitness"
                        target="_blank"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        role="menuitem"
                        onClick={handleActionClick}
                      >
                        Icebreaker Action
                      </a>
                      <a
                        href="https://warpcast.com/~/add-cast-action?url=https%3A%2F%2Fdish.codes%2Fapi%2Factions%2Fbalance"
                        target="_blank"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        role="menuitem"
                        onClick={handleActionClick}
                      >
                        Balance Action
                      </a>
                    </div>
                  </div>
                )}
              </div>
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