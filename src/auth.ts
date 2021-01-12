import { Router } from "express";
import { readFileSync } from "fs";
import * as oauth from "simple-oauth2";
import * as url from "./url";

export interface OAuthProviderClientCredentials {
  id: string;
  secret: string;
}

export interface OAuthProviderRoutes {
  tokenHost: string;
  tokenPath: string;
  authorizePath: string;
}

const AUTH_URL_BASE = url.join(url.ROOT_URL, "auth");

function addAuthenticationMethod(
  router: Router,
  name: string,
  client: OAuthProviderClientCredentials,
  routes: OAuthProviderRoutes
) {
  const redirectUrl = url.join(AUTH_URL_BASE, name, "success");

  const authorizationCode = new oauth.AuthorizationCode({
    client,
    auth: routes,
  });

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
        req.session.authenticationProvider = name;
        req.session.authenticationToken = accessToken;
        res.render("login_success");
      } catch (e) {
        // Access token error
        res.status(400);
        res.render("login", {
          message: "There was a problem, try logging in again.",
        });
      }
  });

  // Add login function
  router.get("/" + name + "/login", async (req, res) => {
    res.redirect(authorizationUrl);
  });
}

export interface AuthMethod {
  credentials: OAuthProviderClientCredentials;
  routes: OAuthProviderRoutes;
}

export interface AuthMethodJsonSpec {
  [key: string]: AuthMethod;
}

export const router = Router();

export function bootloadAuthMethods() {
  const methods: AuthMethodJsonSpec = JSON.parse(
    readFileSync("./o.json", { encoding: "utf-8" })
  );

  for (let [name, method] of Object.entries(methods)) {
    addAuthenticationMethod(router, name, method.credentials, method.routes);
  }
}
