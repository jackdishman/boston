// components/Header.tsx
"use client";

import React from "react";
import { usePrivy, useLogin, useLinkAccount } from "@privy-io/react-auth";
import Menu from "./icons/Menu";
import X from "./icons/X";
import Connect from "./icons/Connect";
import LinkAccount from "./icons/LinkAccount";
import Link from "next/link";

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
    onComplete: async (user, isNewUser) => {
      if (isNewUser) {
        const accessToken = await getAccessToken();
        fetch("/api/new-member", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
      }
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const disableLogin = !ready || (ready && authenticated);

  const { linkWallet } = useLinkAccount({
    onSuccess: async (user, linkedAccount) => {
      console.log(`account linked`, linkedAccount);
    },
    onError: (error) => {},
  });

  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="fixed z-50 w-full bg-gray-100 shadow-md">
      <header className="flex justify-center items-center">
        <nav className="flex justify-between w-full max-w-7xl items-center h-16 px-4">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold">
              🔎
            </Link>
          </div>
          <div className="flex-1 mx-4 relative">
            <input
              type="text"
              placeholder="Search channels"
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
                <button
                  onClick={linkWallet}
                  className="hover:underline flex items-center text-start"
                >
                  <LinkAccount />
                  <span className="ml-2">Link account</span>
                </button>
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
              <button
                onClick={linkWallet}
                className="hover:underline flex items-center text-start"
              >
                <LinkAccount />
                <span className="ml-2 w-32"> Link account</span>
              </button>
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
