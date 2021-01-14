import axios from "axios";
import { client } from "./client";
import { GoogleProfile } from "./profile";

export async function getGoogleUser(code: string): Promise<GoogleProfile> {
  const { tokens } = await client.getToken(code);

  client.setCredentials(tokens);

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
