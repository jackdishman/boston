// components/App.tsx
"use client";

import React, { useState, useEffect } from "react";
import { getAllChannels } from "@/middleware/helpers";
import { IChannelResponse } from "@/types/interfaces";
import Header from "./Header";
import ChannelList from "./ChannelList";

const App: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [channels, setChannels] = useState<IChannelResponse[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchActive, setIsSearchActive] = useState(false);

  useEffect(() => {
    const fetchChannels = async () => {
      const allChannels = await getAllChannels();
      setChannels(allChannels);
    };

    fetchChannels();
  }, []);

  const clearSearch = () => setSearchTerm("");
  const closeSearch = () => {
    setSearchTerm("");
    setIsSearchActive(false);
  };

  useEffect(() => {
    if (searchTerm) {
      setIsSearchActive(true);
    } else {
      setIsSearchActive(false);
    }
  }, [searchTerm]);

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
