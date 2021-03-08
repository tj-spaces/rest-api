import * as fs from "fs";
import * as path from "path";

export interface OAuthProviderClientCredentials {
  id: string;
  secret: string;
}

export default function readCredentials(
  name: string
): OAuthProviderClientCredentials {
  return {
    id: process.env[name.toUpperCase() + "_KEY_ID"],
    secret: process.env[name.toUpperCase() + "_SECRET"],
  };
}
