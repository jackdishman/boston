import { getUsersByFids } from "@/middleware/helpers";
import React from "react";
import { getAllBalances, IBalanceResponse } from "@/middleware/alchemy";
import { TokenBalance } from "@/types/interfaces";
import Link from "next/link";

type Props = {
  params: { fidid: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

const TextToParagraph: React.FC<{ text: string }> = ({ text }) => {
  const renderText = (text: string) => {
    return text.split(" ").map((word, index) => {
      if (word.startsWith("/")) {
        const channel = word.substring(1);
        return (
          <React.Fragment key={index}>
            <Link
              href={`/channel/${channel}`}
              className="underline text-purple-600"
            >
              {word}
            </Link>{" "}
          </React.Fragment>
        );
      } else if (word.startsWith("http://") || word.startsWith("https://")) {
        return (
          <React.Fragment key={index}>
            <a
              href={word}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              {word}
            </a>{" "}
          </React.Fragment>
        );
      } else {
        return <span key={index}>{word} </span>;
      }
    });
  };

  return <p>{renderText(text)}</p>;
};

interface IAddressBalance {
  address: string;
  balances: IBalanceResponse;
}

export default async function Page({ params }: { params: { fid: string } }) {
  const { fid } = params;

  // Fetch user by fid
  const user = await getUsersByFids([fid]);
  const p = user[0];

  const addressBalances: IAddressBalance[] = await Promise.all(
    p.verified_addresses.eth_addresses.map(async (address) => {
      const balances = await getAllBalances(address, "base");
      const ethereumBalances = await getAllBalances(address, "ethereum");

      return {
        address,
        balances: [...balances, ...ethereumBalances],
      };
    })
  );

  return (
    <div className="p-4">
      {/* Top part with user info */}
      <div className="flex">
        <div>
          <img
            src={p.pfp_url}
            alt="avatar"
            className="w-64 h-64 rounded-full"
          />
        </div>
        <div className="ml-5">
          <h1 className="text-3xl font-semibold">{p.display_name}</h1>
          <p className="text-xl">
            @{p.username} ({p.fid})
          </p>
          {/* Use TextToParagraph component to render the bio */}
          <div className="text-lg">
            <TextToParagraph text={p.profile.bio.text} />
          </div>
          <p className="mt-2">Followers: {p.follower_count}</p>
          <p>Following: {p.following_count}</p>
        </div>
      </div>
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Verified ETH Addresses:</h2>
        {addressBalances.map(({ address, balances }) => (
          <div key={address} className="mb-6 border p-4 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-2">{address}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {balances.map((balance) => (
                <div key={balance.contractAddress}>
                  <h4 className="text-lg font-medium mb-2">
                    {balance.name} ({balance.symbol})
                  </h4>
                  <p className="text-gray-700 mb-2">
                    Balance: {balance.balance.toFixed(2)}
                  </p>
                  <p className="text-gray-700">
                    Chain: {balance.chainName}, Contract:{" "}
                    {balance.contractAddress || "Native Token"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
