"use client";

import React, { useState } from "react";
import { usePrivy, useLogin, useLinkAccount } from "@privy-io/react-auth";
import Menu from "./icons/Menu";
import X from "./icons/X";
import Connect from "./icons/Connect";
import LinkAccount from "./icons/LinkAccount";
import Link from "next/link";

export default function Header() {
  const { logout, ready, authenticated, getAccessToken, user } = usePrivy();

  //   handle login
  const { login } = useLogin({
    onComplete: async (user, isNewUser) => {
      if (isNewUser) {
        const accessToken = await getAccessToken();
        // add new user to db
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

  //   handle link wallet
  const { linkWallet } = useLinkAccount({
    onSuccess: async (user, linkedAccount) => {
      // add toast success
      console.log(`account linked`, linkedAccount);
    },
    onError: (error) => {},
  });

  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed z-20 w-full">
      <header className="flex justify-center items-center bg-gray-100 shadow-md">
        <nav className="flex justify-between w-full max-w-7xl items-center h-10 px-4">
          {/* search channels */}
          <div>
            <Link href="/" className="underline hover:font-semibold">
              Search Channels
            </Link>
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
        <div className="md:hidden absolute flex flex-col items-center bg-gray-100 shadow-lg w-full py-4 space-y-4 rounded-b-xl top-10 z-20">
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
}
