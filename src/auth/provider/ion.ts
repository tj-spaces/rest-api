/*
  Copyright (C) Michael Fatemi - All Rights Reserved.
  Unauthorized copying of this file via any medium is strictly prohibited.
  Proprietary and confidential.
  Written by Michael Fatemi <myfatemi04@gmail.com>, February 2021.
*/
import axios from "axios";
import { AuthorizationCode } from "simple-oauth2";
import {
  getUserFromEmail,
  registerFromIonProfile,
} from "../../database/tables/users";
import getRedirectUrl from "../getRedirectUrl";
import readCredentials from "../readCredentials";

const credentials = readCredentials("ion");

export const authorizationCode = new AuthorizationCode({
  client: {
    id: credentials.id,
    secret: credentials.secret,
  },
  auth: {
    tokenHost: "https://ion.tjhsst.edu/oauth/",
    authorizePath: "https://ion.tjhsst.edu/oauth/authorize",
    tokenPath: "https://ion.tjhsst.edu/oauth/token",
  },
});

export const redirectUrl = getRedirectUrl("ion");

export const authorizationUrl = authorizationCode.authorizeURL({
  scope: "read",
  redirect_uri: redirectUrl,
});

export interface IonProfile {
  id: string;
  ion_username: string; // eg "2022mfatemi"
  sex: string; // Capitalized
  title: null;
  display_name: string;
  short_name: string;
  // Given name
  first_name: string;
  // Middle name
  middle_name?: string;
  // Family name
  last_name: string;
  nickname?: string;
  // Internal TJ email (@tjhsst.edu)
  tj_email: string;
  // Other external personal emails
  emails: string[];
  grade: {
    number: number;
    name: string; // freshman, sophomore, junior, senior
  };
  graduation_year?: number;
  user_type: "student" | "teacher" | "";
  phones: string[]; // eg "Mobile Phone: XXXXXXXXXX", including the text "Mobile Phone"
  websites: string[];
  counselor?: {
    id: string;
    // Url to API endpoint for profile info
    url: string;
    user_type: "counselor";
    username: string;
    full_name: string;
    first_name: string;
    last_name: string;
  };
  address: string | null;
  /** DO NOT USE */
  picture: string; // URL of the profile photo of the user. Seems to give empty photos right now.
  is_eighth_admin: boolean;
  is_announcements_admin: boolean;
  is_teacher: boolean;
  is_student: boolean;
  // 8th period absences count
  absences: number;
}

export async function getIonProfile(code: string): Promise<IonProfile> {
  let accessToken = await authorizationCode.getToken({
    code,
    redirect_uri: redirectUrl,
    scope: "read",
  });

  const profileUrl =
    "https://ion.tjhsst.edu/api/profile?format=json&access_token=" +
    accessToken.token.access_token;

  return (await axios.get(profileUrl)).data;
}

export async function getAccountIDFromIonCode(code: string) {
  const profile = await getIonProfile(code);
  const user = await getUserFromEmail(profile.tj_email);

  if (user == null) {
    return await registerFromIonProfile(profile);
  } else {
    return user.id;
  }
}
