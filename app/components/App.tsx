"use client";

import React, { useState, useEffect } from "react";
import { getAccessToken, useLogin, usePrivy } from "@privy-io/react-auth";
import { IChannelResponse } from "@/types/interfaces";
import Header from "./Header";
import ChannelList from "./ChannelList";
import { getAllChannels } from "@/middleware/helpers";

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

  useEffect(() => {
    if (!authenticated) {
      login(); // Automatically trigger login if user is not
    }
  }, [authenticated]);

  useEffect(() => {
    if (searchTerm) {
      setIsSearchActive(true);
    } else {
      setIsSearchActive(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    const fetchChannels = async () => {
      const channels = await getAllChannels(true);
      setChannels(channels);
    };
    fetchChannels();
  }, []);

  if (!authenticated) {
    return <div></div>;
  }

  return (
    <>
      <Header
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        clearSearch={clearSearch}
        closeSearch={closeSearch}
        isSearchActive={isSearchActive}
      />
      {isSearchActive && (
        <ChannelList
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
