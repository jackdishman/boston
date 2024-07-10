"use client";

import React, { useState, useEffect } from "react";
import { IChannelResponse } from "@/types/interfaces";
import Header from "./Header";
import ChannelList from "./ChannelList";

interface AppProps {
  channels: IChannelResponse[];
  children: React.ReactNode;
}

const App: React.FC<AppProps> = ({ channels, children }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchActive, setIsSearchActive] = useState(false);

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
