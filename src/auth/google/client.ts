import getRedirectUrl from "../getRedirectUrl";
import readCredentials from "../readCredentials";
import * as googleapis from "googleapis";

const credentials = readCredentials("google");

export const client = new googleapis.Auth.OAuth2Client({
  clientId: credentials.id,
  clientSecret: credentials.secret,
  redirectUri: getRedirectUrl("google"),
});

/*
 * Generate a url that asks permissions to the user's email and profile
 */
const scopes = [
  "https://www.googleapis.com/auth/userinfo.profile",
  "https://www.googleapis.com/auth/userinfo.email",
];

export const authorizationUrl = client.generateAuthUrl({
  access_type: "offline",
  prompt: "consent",
  scope: scopes, // If you only need one scope you can pass it as string
  redirect_uri: getRedirectUrl("google"),
});
