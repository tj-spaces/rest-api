import axios from "axios";
import { client } from "./client";

export interface GoogleProfile {
  id: string; // A string of digits
  email: string;
  verified_email: boolean;
  name: string; // This is the full name
  given_name: string; // In most of Europe, this is the first name, e.g. John
  family_name: string; // In most of Europe, this is the last name, e.g. Cena
  picture: string; // URL to a profile photo
  locale: "en"; // The user's preferred language
}

export async function getGoogleProfile(code: string): Promise<GoogleProfile> {
  const { tokens } = await client.getToken(code);

  const profileUrl = `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${tokens.access_token}`;

  // Fetch the user's profile with the access token and bearer
  return (
    await axios.get(profileUrl, {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    })
  ).data;
}
