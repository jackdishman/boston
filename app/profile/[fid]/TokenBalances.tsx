"use client";

import Base from "@/app/components/icons/Base";
import Ethereum from "@/app/components/icons/Ethereum";
import { TokenBalance } from "@/types/interfaces";
import React, { useState } from "react";

interface IProps {
  addressBalances: { address: string; balances: TokenBalance[] }[];
}

export default function TokenBalances(props: IProps) {
  const { addressBalances } = props;

  const [filter, setFilter] = useState<"all" | "base" | "ethereum">("all");
  const [selectedAddress, setSelectedAddress] = useState<string>("all");

  const combineBalances = (balances: TokenBalance[]) => {
    const combined: { [key: string]: TokenBalance } = {};

    balances.forEach((balance) => {
      const key = balance.contractAddress || balance.symbol;
      if (combined[key]) {
        combined[key].balance += balance.balance;
      } else {
        combined[key] = { ...balance };
      }
    });

    return Object.values(combined);
  };

  const filteredBalances = () => {
    let balances =
      selectedAddress === "all"
        ? addressBalances.flatMap(({ balances }) => balances)
        : addressBalances.find(({ address }) => address === selectedAddress)
            ?.balances || [];

    if (selectedAddress === "all") {
      balances = combineBalances(balances);
    }

    return balances
      .filter((balance) => {
        if (filter === "all") return true;
        return balance.chainName === filter;
      })
      .sort((a, b) => (a.contractAddress ? 1 : -1)); // Sort native balances to the top
  };

  return (
    <div className="mt-8">
      {/* Filter buttons */}
      <div className="flex justify-start space-x-4 mb-4">
        <button
          onClick={() => setFilter("all")}
          className={`${
            filter === "all" ? "bg-blue-500 text-white" : "bg-gray-200"
          } px-4 py-2 rounded`}
        >
          All Tokens
        </button>
        <button
          onClick={() => setFilter("base")}
          className={`${
            filter === "base" ? "bg-blue-500 text-white" : "bg-gray-200"
          } px-4 py-2 rounded`}
        >
          Base Tokens
        </button>
        <button
          onClick={() => setFilter("ethereum")}
          className={`${
            filter === "ethereum" ? "bg-blue-500 text-white" : "bg-gray-200"
          } px-4 py-2 rounded`}
        >
          Ethereum Tokens
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-center mb-4">
        <label className="text-2xl font-semibold mr-4">
          Verified ETH Addresses:
        </label>
        {/* Address filter */}
        <select
          value={selectedAddress}
          onChange={(e) => setSelectedAddress(e.target.value)}
          className="px-4 py-2 border rounded w-64"
        >
          <option value="all">All Addresses</option>
          {addressBalances.map(({ address }) => (
            <option key={address} value={address}>
              {address}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {filteredBalances().map((balance) => (
          <div className="flex" key={balance.contractAddress || balance.name}>
            <div className="m-2">
              {balance.chainName === "base" ? <Base /> : <Ethereum />}
            </div>
            <div>
              <h4 className="text-lg font-medium">{balance.name}</h4>
              <p className="text-gray-700">
                {balance.balance.toFixed(2)} {balance.symbol}
              </p>
              {balance.contractAddress && (
                <a
                  href={
                    balance.chainName === "base"
                      ? `https://basescan.org/address/${balance.contractAddress}`
                      : `https://etherscan.org/address/${balance.contractAddress}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline ml-2"
                >
                  Contract
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
