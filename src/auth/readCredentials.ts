import * as fs from "fs";

export interface OAuthProviderClientCredentials {
  id: string;
  secret: string;
}

export default function readCredentials(
  name: string
): OAuthProviderClientCredentials {
  return JSON.parse(
    fs.readFileSync("../../credentials/" + name + ".json", {
      encoding: "utf-8",
    })
  );
}
