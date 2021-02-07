import { db } from "..";
import { GoogleProfile } from "../../auth/google/profile";
import { IonProfile } from "../../auth/ion/profile";
import createUuid from "../../lib/createUuid";
import { nextID } from "../../lib/snowflakeID";
import { PublicUserInfo } from "./user_relations";

export interface User {
  id: string; // A string of digits
  email: string;
  verified_email: boolean;
  name: string; // This is the full name
  given_name: string; // In most of Europe, this is the first name, e.g. John
  family_name: string; // In most of Europe, this is the last name, e.g. Cena
  picture: string; // URL to a profile photo
  locale: "en"; // The user's preferred language
}

export async function doesUserExistWithEmail(email: string) {
  let result = await db.query(`SELECT 1 FROM "users" WHERE "email" = $1`, [
    email,
  ]);

  return result.rowCount > 0;
}

/**
 * Function to ensure that all users exist
 * @param userIDs The set of user ids to check
 */
export async function doAllUsersExistWithIDs(
  userIDs: Set<string>
): Promise<boolean> {
  const results = await Promise.all(
    Array.from(userIDs).map((userID) => doesUserExistWithID(userID))
  );

  return results.every((exists) => exists);
}

export async function doesUserExistWithID(id: string) {
  let result = await db.query(`SELECT 1 FROM "users" WHERE "id" = $1 LIMIT 1`, [
    id,
  ]);

  return result.rowCount > 0;
}

export async function getUserFromEmail(email: string): Promise<User | null> {
  if (email in userFromEmailCache) {
    let timeSinceCacheUpdate =
      Date.now() - userFromEmailCache[email].updateTime;
    if (timeSinceCacheUpdate < MAX_CACHE_AGE) {
      return new Promise((resolve) => resolve(userFromEmailCache[email].user));
    }
  }

  let results = await db.query(
    `SELECT * FROM "users" WHERE "email" = $1 LIMIT 1`,
    [email]
  );

  return results.rowCount > 0 ? results.rows[0] : null;
}

const userFromIDCache: {
  [id: string]: { updateTime: number; user: User };
} = {};

const userFromEmailCache: {
  [email: string]: { updateTime: number; user: User };
} = {};

const MAX_CACHE_AGE = 3600;

export async function getUserFromID(id: string): Promise<User | null> {
  if (id in userFromIDCache) {
    let timeSinceCacheUpdate = Date.now() - userFromIDCache[id].updateTime;
    if (timeSinceCacheUpdate < MAX_CACHE_AGE) {
      return new Promise((resolve) => resolve(userFromIDCache[id].user));
    }
  }

  let results = await db.query(`SELECT * FROM "users" WHERE "id" = $1`, [id]);

  return results.rowCount > 0 ? results.rows[0] : null;
}

export async function getPublicUserFromID(id: string): Promise<PublicUserInfo> {
  if (id in userFromIDCache) {
    let timeSinceCacheUpdate = Date.now() - userFromIDCache[id].updateTime;
    if (timeSinceCacheUpdate < MAX_CACHE_AGE) {
      return new Promise((resolve) => resolve(userFromIDCache[id].user));
    }
  }

  let results = await db.query<PublicUserInfo>(
    `SELECT id, name, picture FROM "users" WHERE "id" = $1`,
    [id]
  );

  return results.rowCount > 0 ? results.rows[0] : null;
}

/**
 * Returns the ID of the newly-created user
 */
export async function registerFromIonProfile(profile: IonProfile) {
  let id = nextID();

  await db.query(
    `INSERT INTO "users" ("id", "email", "verified_email", "name", "given_name", "family_name", "picture", "locale") values ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      id,
      profile.tj_email,
      true,
      profile.display_name,
      profile.first_name,
      profile.last_name,
      null, // profile.picture, (( This property doesn't work correctly on Ion ))
      "en", // Assume "en" because Ion is used at TJ
    ]
  );

  return id.toString();
}

export async function registerFromGoogleProfile(profile: GoogleProfile) {
  let id = nextID();

  await db.query(
    `INSERT INTO "users" ("id", "email", "verified_email", "name", "given_name", "family_name", "picture", "locale") values ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      id,
      profile.email,
      profile.verified_email,
      profile.name,
      profile.given_name,
      profile.family_name,
      profile.picture,
      profile.locale,
    ]
  );

  return id.toString();
}
