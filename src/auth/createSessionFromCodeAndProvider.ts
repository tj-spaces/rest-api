import { createSession } from "../session";
import getAccountIDFromGoogleCode from "./google/getAccountID";
import getAccountIDFromIonCode from "./ion/getAccountID";

/**
 * Given an authorization code and the OAuth provider, load the profile of the user
 * from the OAuth provider and use it to log in
 */
export default async function createSessionFromCodeAndProvider(
  code: string,
  provider: "google" | "ion"
) {
  let accountID: string;
  if (provider === "google") {
    accountID = await getAccountIDFromGoogleCode(code);
  } else if (provider === "ion") {
    accountID = await getAccountIDFromIonCode(code);
  } else {
    throw new Error("Provider type is invalid");
  }

  return createSession(accountID);
}
