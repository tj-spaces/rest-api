import getRedirectUrl from "../getRedirectUrl";
import readCredentials from "../readCredentials";
import * as googleapis from "googleapis";

const credentials = readCredentials("google");

export const client = new googleapis.Auth.OAuth2Client({
  clientId: credentials.id,
  clientSecret: credentials.secret,
  redirectUri: getRedirectUrl("google"),
});

export const authorizationUrl = client.generateAuthUrl({
  access_type: "offline",
  prompt: "consent",
  scope: [
    "https://www.googleapis.com/auth/userinfo.profile",
    "https://www.googleapis.com/auth/userinfo.email",
  ],
  redirect_uri: getRedirectUrl("google"),
});
