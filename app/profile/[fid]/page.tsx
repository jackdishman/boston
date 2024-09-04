import { getIcebreakerProfile, getUsersByFids } from "@/middleware/helpers";
import React from "react";
import { getAllBalances, IBalanceResponse } from "@/middleware/alchemy";
import Link from "next/link";
import TokenBalances from "./TokenBalances";

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
  const icebreakerRes = await getIcebreakerProfile(fid);
  const icebreakerProfile = icebreakerRes?.profiles[0];

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
      <div className="sm:flex">
        <div className="flex justify-center">
          <img
            src={p.pfp_url}
            alt="avatar"
            className="w-64 h-64 rounded-full"
          />
        </div>
        <div className="my-5 sm:ml-5">
          <h1 className="text-3xl font-semibold text-center sm:text-left">
            {p.display_name}
          </h1>
          <p className="text-xl text-center sm:text-left">
            @{p.username} ({p.fid})
          </p>
          {/* Use TextToParagraph component to render the bio */}
          <div className="text-lg my-4 text-center sm:text-left">
            <TextToParagraph text={p.profile.bio.text} />
          </div>
          {/* middle section: stats and personal info */}
          <div className="mt-2 flex justify-around sm:flex-col">
            <div>
              <p>Followers: {p.follower_count}</p>
              <p>Following: {p.following_count}</p>
            </div>
            <div className="text-gray-800">
              <p>Job title: {icebreakerProfile?.jobTitle || "N/A"}</p>
              <p>Location: {icebreakerProfile?.location}</p>
            </div>
          </div>
        </div>
        {/* Channels */}
        <div className="flex sm:flex-col sm:items-end flex-wrap">
          {icebreakerProfile?.channels.map((channel, index) => (
            <a
              key={index}
              href={channel.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-lg font-semibold capitalize text-gray-700 hover:underline p-4"
            >
              {channel.type} {channel.isVerified && "✅"}
            </a>
          ))}
        </div>
      </div>

      {/* Credentials */}
      <div className="my-6">
        <h3 className="text-lg font-semibold">Credentials</h3>
        {icebreakerProfile?.credentials.map((credential, index) => (
          <div key={index}>
            <p className="text-gray-700">
              {credential.name}{" "}
              <a
                href={
                  (credential.chain === "base"
                    ? `https://base.easscan.org/attestation/view/`
                    : `https://easscan.org/attestation/view/`) +
                  credential.reference
                }
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                {credential.source}
              </a>
            </p>
          </div>
        ))}
      </div>

      {/* Highlights */}
      <div className="my-6">
        <h3 className="text-lg font-semibold">Highlights</h3>
        {icebreakerProfile?.highlights.map((highlight, index) => (
          <div key={index}>
            <p className="text-gray-700">
              <a
                href={highlight.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                {highlight.title}
              </a>
            </p>
          </div>
        ))}
      </div>

      {/* Work Experience */}
      <div className="my-6">
        <h3 className="text-lg font-semibold">Work Experience</h3>
        {icebreakerProfile?.workExperience.map((experience, index) => (
          <div key={index} className="mb-4">
            <p className="font-semibold text-gray-700">{experience.jobTitle}</p>
            <p className="text-gray-500">{experience.employmentType}</p>
            <p className="text-gray-500">{experience.location}</p>
            <a
              href={experience.orgWebsite}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              {experience.orgWebsite}
            </a>
            <p className="text-gray-500">
              {new Date(experience.startDate).toLocaleDateString()} -{" "}
              {experience.endDate
                ? new Date(experience.endDate).toLocaleDateString()
                : "Present"}
            </p>
          </div>
        ))}
      </div>

      {/* Token Balances */}
      <TokenBalances addressBalances={addressBalances} />
    </div>
  );
}
