import {
  doesUserExistWithEmail,
  getUserFromEmail,
  registerFromIonProfile,
} from "../../database/tables/users";
import { getIonUser } from "./getUser";

export default async function getAccountId(code: string) {
  const profile = await getIonUser(code);
  const email = profile.tj_email;
  const user = await getUserFromEmail(profile.tj_email);

  let accountId: number;

  if (!doesUserExistWithEmail(email)) {
    accountId = await registerFromIonProfile(profile);
  } else {
    accountId = user.id;
  }

  return accountId;
}
