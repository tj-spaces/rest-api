import { Router } from "express";
import { AuthorizationCode } from "simple-oauth2";
import {
  getUserFromEmail,
  registerFromIonProfile,
} from "database/tables/users";
import getLoginErrorUrl from "auth/getLoginErrorUrl";
import getRedirectUrl from "auth/getRedirectUrl";
import readCredentials from "auth/readCredentials";
import axios from "axios";

export const router = Router();

const credentials = readCredentials("ion");

const authorizationCode = new AuthorizationCode({
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

const redirectUrl = getRedirectUrl("ion");

const authorizationUrl = authorizationCode.authorizeURL({
  scope: "read",
  redirect_uri: redirectUrl,
});

router.get("/callback", async (req, res) => {
  let { code } = req.query;

  if (typeof code !== "string") {
    res.redirect(getLoginErrorUrl());
  } else
    try {
      const ionUser = await getIonUser(code);

      const user = await getUserFromEmail(ionUser.tj_email);
      let isNewAccount = user == null;

      let id: string;

      if (isNewAccount) {
        ({ id } = await registerFromIonProfile(ionUser));
      } else {
        ({ id } = user);
      }

      req.session.accountId = id;
      req.session.isLoggedIn = true;

      res.redirect(isNewAccount ? "/new-account" : "/");
    } catch (e) {
      console.log(e);
      // Access token error
      res.redirect(getLoginErrorUrl());
    }
});

// Add login function
router.get("/login", async (req, res) => {
  res.redirect(authorizationUrl);
});

async function getIonUser(code: string) {
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
