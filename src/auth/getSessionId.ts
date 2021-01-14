import { createSession } from "../session";
import googleGetAccountId from "./google/getAccountId";
import ionGetAccountId from "./ion/getAccountId";

/**
 * Given an authorization code and the OAuth provider, load the profile of the user
 * from the OAuth provider and use it to log in
 */
export default async function getSessionId(
  code: string,
  provider: "google" | "ion"
) {
  let accountId: number;
  if (provider === "google") {
    accountId = await googleGetAccountId(code);
  } else if (provider === "ion") {
    accountId = await ionGetAccountId(code);
  } else {
    throw new Error("Provider type is invalid");
  }

  return createSession(accountId);
}
