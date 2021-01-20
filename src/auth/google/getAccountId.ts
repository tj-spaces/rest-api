import {
  getUserFromEmail,
  registerFromGoogleProfile,
} from "../../database/tables/users";
import { getGoogleProfile } from "./profile";

export default async function getAccountId(code: string): Promise<string> {
  const profile = await getGoogleProfile(code);
  const user = await getUserFromEmail(profile.email);

  if (user == null) {
    return await registerFromGoogleProfile(profile);
  } else {
    return user.id;
  }
}
