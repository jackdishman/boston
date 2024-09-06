export interface IOpenRankProfileResponse {
  fid: number;
  username: string;
  score: number;
  rank: number;
  percentile: number;
}

export async function getOpenRank(
  fids: number[]
): Promise<IOpenRankProfileResponse[] | undefined> {
  try {
    const res = await fetch(
      "https://graph.cast.k3l.io/scores/global/following/fids",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(fids),
      }
    );
    const data = await res.json();
    return data.result;
  } catch (error) {
    console.error(error);
  }
}
