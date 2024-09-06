import { IOpenRankProfileResponse } from "@/middleware/openrank";
import React from "react";

interface IProps {
  followingRank: IOpenRankProfileResponse;
  engagementRank: IOpenRankProfileResponse;
}

export default function OpenRankData(props: IProps) {
  const { followingRank, engagementRank } = props;
  return (
    <div className="my-6">
      <h3 className="text-lg font-semibold">OpenRank Data</h3>
      <p>Following Rank: {followingRank.rank}</p>
      <p>Engagement Rank: {engagementRank.rank}</p>
    </div>
  );
}
