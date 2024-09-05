"use client";

import Base from "@/app/components/icons/Base";
import Ethereum from "@/app/components/icons/Ethereum";
import { TokenBalance } from "@/types/interfaces";
import React from "react";

interface IProps {
  addressBalances: { address: string; balances: TokenBalance[] }[];
  activeAddress: string;
  activeNetwork: string;
}

export default function TokenBalances(props: IProps) {
  const { addressBalances, activeAddress, activeNetwork } = props;

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
      activeAddress === "all"
        ? addressBalances.flatMap(({ balances }) => balances)
        : addressBalances.find(({ address }) => address === activeAddress)
            ?.balances || [];
    if (activeAddress === "all") balances = combineBalances(balances);

    return balances
      .filter((balance) => {
        if (activeNetwork === "all") return true;
        if (activeNetwork === "base") return balance.chainName === "base";
        return balance.chainName === "ethereum";
      })
      .sort((a, b) => (a.contractAddress ? 1 : -1)); // Sort native balances to the top
  };

  return (
    <div className="mt-8">
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
