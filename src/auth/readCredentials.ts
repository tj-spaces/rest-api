import * as fs from "fs";
import * as path from "path";

export interface OAuthProviderClientCredentials {
  id: string;
  secret: string;
}

export default function readCredentials(
  name: string
): OAuthProviderClientCredentials {
  return JSON.parse(
    fs.readFileSync(path.resolve(__dirname, `../../credentials/${name}.json`), {
      encoding: "utf-8",
    })
  );
}
