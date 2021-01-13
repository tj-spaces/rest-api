import { Router } from "express";
import { AuthorizationCode } from "simple-oauth2";
import getLoginErrorUrl from "./getLoginErrorUrl";
import getRedirectUrl from "./getRedirectUrl";
import readCredentials from "./readCredentials";

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

router.get("/" + name + "/success", async (req, res) => {
  let { code } = req.query;

  if (typeof code !== "string") {
    // Access token error
  } else
    try {
      let accessToken = await authorizationCode.getToken({
        code,
        redirect_uri: redirectUrl,
        scope: "read",
      });

      // You are now logged in, and you have the access token
      req.session.isLoggedIn = true;
      req.session.authenticationProvider = "ion";
      req.session.authenticationToken = accessToken;

      // Check if the user exists

      res.redirect("/");
    } catch (e) {
      console.log(e);
      // Access token error
      res.redirect(getLoginErrorUrl());
    }
});

// Add login function
router.get("/" + name + "/login", async (req, res) => {
  res.redirect(authorizationUrl);
});
