import {
  getUserFromEmail,
  registerFromGoogleProfile,
} from "../../database/tables/users";
import { getGoogleUser } from "./profile";

export default async function getAccountId(code: string): Promise<number> {
  const profile = await getGoogleUser(code);
  const user = await getUserFromEmail(profile.email);

  if (user == null) {
    return await registerFromGoogleProfile(profile);
  } else {
    return user.id;
  }
}
