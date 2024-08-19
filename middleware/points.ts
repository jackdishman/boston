import { StackClient } from "@stackso/js-core";

const stack = new StackClient({
  // This is your API key, please keep it secret:
  apiKey: "a7e713ca-dbf4-4f94-81ba-c55d9b546d6a",
  pointSystemId: 3157,
});

export async function rewardPoints(
  action: string,
  account: string,
  points: number
): Promise<void> {
  await stack.track(action, {
    account,
    points,
  });
}

export async function getPoints(account: string): Promise<number> {
  const points = await stack.getPoints(account);
  console.log("Points:", points);
  return points;
}
