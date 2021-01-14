import { AuthorizationCode } from "simple-oauth2";
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
