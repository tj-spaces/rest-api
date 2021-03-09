/*
  Copyright (C) Michael Fatemi - All Rights Reserved.
  Unauthorized copying of this file via any medium is strictly prohibited.
  Proprietary and confidential.
  Written by Michael Fatemi <myfatemi04@gmail.com>, February 2021.
*/
import { createSession } from "../session";
import { getAccountIDFromGoogleCode } from "./provider/google";
import { getAccountIDFromIonCode } from "./provider/ion";

const methods = {
  google: getAccountIDFromGoogleCode,
  ion: getAccountIDFromIonCode,
};

/**
 * Given an authorization code and the OAuth provider, load the profile of the user
 * from the OAuth provider and use it to log in
 */
export default async function createSessionFromCodeAndProvider(
  code: string,
  provider: "google" | "ion"
) {
  if (provider in methods) {
    let accountID = await methods[provider](code);
    return createSession(accountID);
  } else {
    throw new Error("Invalid provider type");
  }
}
