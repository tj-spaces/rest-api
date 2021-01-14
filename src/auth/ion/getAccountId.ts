import {
  getUserFromEmail,
  registerFromIonProfile,
} from "../../database/tables/users";
import { getIonProfile } from "./profile";

export default async function getAccountIdFromIonCode(code: string) {
  const profile = await getIonProfile(code);
  const user = await getUserFromEmail(profile.tj_email);

  if (user == null) {
    return await registerFromIonProfile(profile);
  } else {
    return user.id;
  }
}
