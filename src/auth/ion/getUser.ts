import axios from "axios";
import { authorizationCode, redirectUrl } from "./client";
import { IonProfile } from "./profile";

export async function getIonUser(code: string): Promise<IonProfile> {
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
