"use client";

import React, { useState, useEffect } from "react";
import { getAccessToken, useLogin, usePrivy } from "@privy-io/react-auth";
import { IChannelResponse, IEvent } from "@/types/interfaces";
import Header from "./Header";
import SearchList from "./SearchList";

interface AppProps {
  children: React.ReactNode;
}

const App: React.FC<AppProps> = ({ children }) => {
  const [viewingInFrame, setViewingInFrame] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [channels, setChannels] = useState<IChannelResponse[]>([]);
  const { authenticated } = usePrivy();

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
      console.error(error);
    },
  });

  const loginWrapper = async () => {
    if (viewingInFrame || window !== window.parent) return;
    await login(); // Trigger login here
  };

  const clearSearch = () => setSearchTerm("");
  const closeSearch = () => {
    setSearchTerm("");
    setIsSearchActive(false);
  };

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
    if (!window) setViewingInFrame(true);
    if (window === window.parent) {
      setViewingInFrame(false);
    } else {
      setViewingInFrame(true);
    }
  }, []);

  useEffect(() => {
    if (!authenticated) {
      loginWrapper();
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

  if (!authenticated && !viewingInFrame) return null;

  return (
    <>
      {viewingInFrame ? (
        <div className="fixed z-50 w-full bg-gray-100 shadow-md">
          <header className="flex justify-center items-center">
            <nav className="flex justify-between w-full max-w-7xl items-center h-16 px-4">
              <div className="flex-1 mx-4 relative">
                <p>Dish Codes: Frame Preview</p>
              </div>
            </nav>
          </header>
        </div>
      ) : (
        <Header
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          clearSearch={clearSearch}
          closeSearch={closeSearch}
          isSearchActive={isSearchActive}
          login={loginWrapper}
        />
      )}
      {isSearchActive && (
        <SearchList
          channels={channels}
          searchTerm={searchTerm}
          closeSearch={closeSearch}
        />
      )}
      {children}
    </>
  );
};

export default App;
