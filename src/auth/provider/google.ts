/*
  Copyright (C) Michael Fatemi - All Rights Reserved.
  Unauthorized copying of this file via any medium is strictly prohibited.
  Proprietary and confidential.
  Written by Michael Fatemi <myfatemi04@gmail.com>, February 2021.
*/
import axios from "axios";
import {
  getUserFromEmail,
  registerFromGoogleProfile,
} from "../../database/tables/users";
import getRedirectUrl from "../getRedirectUrl";
import readCredentials from "../readCredentials";

export interface GoogleProfile {
  id: string; // A string of digits
  email: string;
  verified_email: boolean;
  name: string; // This is the full name
  given_name: string; // In most of Europe, this is the first name, e.g. John
  family_name: string; // In most of Europe, this is the last name, e.g. Cena
  picture: string; // URL to a profile photo
  locale: "en"; // The user's preferred language
}

const tokenURL = "https://oauth2.googleapis.com/token";
const credentials = readCredentials("google");

async function getTokenFromCode(code: string) {
  let response = await axios.post(
    tokenURL,
    {
      code,
      grant_type: "authorization_code",
      client_id: credentials.id,
      client_secret: credentials.secret,
      redirect_uri: getRedirectUrl("google"),
    },
    { headers: { "Content-Type": "application/json" } }
  );

  return response.data;
}

export async function getGoogleProfile(code: string): Promise<GoogleProfile> {
  const tokens = await getTokenFromCode(code);

  const profileUrl = `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${tokens.access_token}`;

  // Fetch the user's profile with the access token and bearer
  let response = await axios.get(profileUrl, {
    headers: {
      Authorization: `Bearer ${tokens.access_token}`,
    },
  });

  return response.data;
}

export async function getAccountIDFromGoogleCode(
  code: string
): Promise<string> {
  const profile = await getGoogleProfile(code);
  const user = await getUserFromEmail(profile.email);

  if (user == null) {
    return await registerFromGoogleProfile(profile);
  } else {
    return user.id;
  }
}
