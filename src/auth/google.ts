import * as googleapis from "googleapis";
import { Router } from "express";
import axios from "axios";
import readCredentials from "./readCredentials";
import getRedirectUrl from "./getRedirectUrl";
import { GoogleProfile } from "../profile/googleProfile";
import { getUserFromEmail, registerFromGoogleProfile } from "./accountUtil";

export const router = Router();

router.get("/callback", async (req, res) => {
  const { code } = req.query;

  if (typeof code !== "string") {
    res.status(400);
    return;
  }

  try {
    const googleUser = await getGoogleUser(code);

    const user = await getUserFromEmail(googleUser.email);
    let isNewAccount = user == null;

    let id: string;

    if (isNewAccount) {
      ({ id } = await registerFromGoogleProfile(googleUser));
    } else {
      ({ id } = user);
    }

    req.session.authenticationProvider = "google";
    req.session.accountId = id;
    req.session.isLoggedIn = true;

    res.redirect(isNewAccount ? "/new-account" : "/");
  } catch (e) {
    console.error(e);

    res.status(500);
  }
});

router.get("/login", (req, res) => {
  res.redirect(getGoogleAuthURL());
});

const credentials = readCredentials("google");

const oauth2Client = new googleapis.Auth.OAuth2Client({
  clientId: credentials.id,
  clientSecret: credentials.secret,
  redirectUri: getRedirectUrl("google"),
});

function getGoogleAuthURL() {
  /*
   * Generate a url that asks permissions to the user's email and profile
   */
  const scopes = [
    "https://www.googleapis.com/auth/userinfo.profile",
    "https://www.googleapis.com/auth/userinfo.email",
  ];

  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: scopes, // If you only need one scope you can pass it as string
    redirect_uri: getRedirectUrl("google"),
  });
}

async function getGoogleUser(code: string): Promise<GoogleProfile> {
  const { tokens } = await oauth2Client.getToken(code);

  oauth2Client.setCredentials(tokens);

  // Fetch the user's profile with the access token and bearer
  const googleUser = await axios.get(
    `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${tokens.access_token}`,
    {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    }
  );

  return googleUser.data;
}
