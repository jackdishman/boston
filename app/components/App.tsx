"use client";

import React, { useState, useEffect } from "react";
import { getAccessToken, useLogin, usePrivy } from "@privy-io/react-auth";
import { IChannelResponse, IEvent } from "@/types/interfaces";
import Header from "./Header";
import SearchList from "./SearchList";
import { NeynarContextProvider, Theme } from "@neynar/react";

interface AppProps {
  children: React.ReactNode;
}

const App: React.FC<AppProps> = ({ children }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [channels, setChannels] = useState<IChannelResponse[]>([]);
  const { authenticated } = usePrivy();

  const clearSearch = () => setSearchTerm("");
  const closeSearch = () => {
    setSearchTerm("");
    setIsSearchActive(false);
  };

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

  const fetchChannels = async (search: string): Promise<IChannelResponse[]> => {
    const channels = await fetch("/api/search-channels", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${await getAccessToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ search }),
    });
    const data = await channels.json();
    return data.channels as IChannelResponse[];
  };

  useEffect(() => {
    if (!authenticated) {
      login(); // Automatically trigger login if user is not
    }
  }, [authenticated]);

  useEffect(() => {
    if (searchTerm) {
      setIsSearchActive(true);
      fetchChannels(searchTerm).then((data) => setChannels(data));
    } else {
      setIsSearchActive(false);
    }
  }, [searchTerm]);

  if (!authenticated) {
    return <div></div>;
  }

  return (
    <>
      <NeynarContextProvider
        settings={{
          clientId: process.env.NEXT_PUBLIC_NEYNAR_CLIENT_ID || "",
          defaultTheme: Theme.Light,
          eventsCallbacks: {
            onAuthSuccess: () => {},
            onSignout() {},
          },
        }}
      >
        <Header
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          clearSearch={clearSearch}
          closeSearch={closeSearch}
          isSearchActive={isSearchActive}
        />
        {isSearchActive && (
          <SearchList
            channels={channels}
            searchTerm={searchTerm}
            closeSearch={closeSearch}
          />
        )}
        {children}
      </NeynarContextProvider>
    </>
  );
};

export default App;
