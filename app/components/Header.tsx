"use client";

import React, { useState } from "react";
import { usePrivy, useLogin, useLinkAccount } from "@privy-io/react-auth";
import Link from "next/link";
import Menu from "./icons/Menu";
import X from "./icons/X";
import Members from "./icons/Members";
import Calendar from "./icons/Calendar";
import Cast from "./icons/Cast";
import Connect from "./icons/Connect";
import LinkAccount from "./icons/LinkAccount";

export default function Header() {
  const { logout, ready, authenticated, getAccessToken, user } = usePrivy();

  console.log(`user`, user);
  //   handle login
  const { login } = useLogin({
    onComplete: async (isNewUser) => {
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
        <nav className="flex justify-between w-full max-w-7xl items-center h-20 px-4">
          <Link
            href="/"
            className="text-4xl font-bold font-serif rounded-lg px-4 py-2"
          >
            Boston 🦞 FC
          </Link>
          <div className="hidden md:flex space-x-6">
            <Link href="/members" className="hover:underline flex items-center">
              <Members />
              <span className="ml-2">Members</span>
            </Link>
            <Link href="/events" className="hover:underline flex items-center">
              <Calendar />
              <span className="ml-2">Events</span>
            </Link>
            <Link href="/casts" className="hover:underline flex items-center">
              <Cast />
              <span className="ml-2">Casts</span>
            </Link>
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
        <div className="md:hidden absolute flex flex-col items-center bg-gray-100 shadow-lg w-full py-4 space-y-4 rounded-b-xl top-20 z-20">
          <Link
            href="/members"
            className="hover:underline flex items-center"
            onClick={() => setIsOpen(false)}
          >
            <Members />
            <span className="ml-2 w-32">Members</span>
          </Link>
          <Link
            href="/events"
            className="hover:underline flex items-center"
            onClick={() => setIsOpen(false)}
          >
            <Calendar />
            <span className="ml-2 w-32">Events</span>
          </Link>
          <Link
            href="/casts"
            className="hover:underline flex items-center"
            onClick={() => setIsOpen(false)}
          >
            <Cast />
            <span className="ml-2 w-32">Casts</span>
          </Link>
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
