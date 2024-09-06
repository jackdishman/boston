import { IOpenRankProfileResponse } from "@/middleware/openrank";
import React from "react";

interface IProps {
  profileRank: IOpenRankProfileResponse;
}

export default function OpenRankData(props: IProps) {
  const { profileRank } = props;
  return (
    <div className="my-6">
      <h3 className="text-lg font-semibold">OpenRank Data</h3>
      <p>Profile Rank: {profileRank.rank}</p>
      <p className="font-medium">Percentile: {profileRank.percentile}%</p>
    </div>
  );
}
