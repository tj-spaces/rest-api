import { createSession } from "../session";
import getAccountIdFromGoogleCode from "./google/getAccountId";
import getAccountIdFromIonCode from "./ion/getAccountId";

/**
 * Given an authorization code and the OAuth provider, load the profile of the user
 * from the OAuth provider and use it to log in
 */
export default async function createSessionFromCodeAndProvider(
  code: string,
  provider: "google" | "ion"
) {
  let accountId: number;
  if (provider === "google") {
    accountId = await getAccountIdFromGoogleCode(code);
  } else if (provider === "ion") {
    accountId = await getAccountIdFromIonCode(code);
  } else {
    throw new Error("Provider type is invalid");
  }

  return createSession(accountId);
}
