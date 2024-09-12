import { StackClient } from "@stackso/js-core";

const stack = new StackClient({
  // This is your API key, please keep it secret:
  apiKey: "a7e713ca-dbf4-4f94-81ba-c55d9b546d6a",
  pointSystemId: 3157,
});

export async function rewardPoints(
  action: string,
  account: string | null,
  points: number
): Promise<void> {
  if (process.env.NEXT_PUBLIC_REWARD_POINTS !== "true") {
    return;
  }
  if (!account) return;
  await stack.track(action, {
    account,
    points,
  });
}

export async function getPoints(account: string): Promise<number> {
  if (process.env.NEXT_PUBLIC_REWARD_POINTS !== "true") {
    return -1;
  }

  if (!account) return 0;

  const points = await stack.getPoints(account);
  return points;
}
