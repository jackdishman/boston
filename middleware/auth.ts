import { AuthTokenClaims, PrivyClient, User } from "@privy-io/server-auth";

export async function checkPrivyAuth(
  authToken: string
): Promise<AuthTokenClaims | null> {
  const privy = new PrivyClient(
    process.env.PRIVY_APP_ID ?? "",
    process.env.PRIVY_APP_SECRET ?? ""
  );
  return await privy.verifyAuthToken(authToken);
}

export async function getPrivyUserByDid(did: string): Promise<User> {
  const privy = new PrivyClient(
    process.env.PRIVY_APP_ID ?? "",
    process.env.PRIVY_APP_SECRET ?? ""
  );
  return await privy.getUser(did);
}
