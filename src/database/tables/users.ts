import { getDatabaseConnection } from "../index";
import { GoogleProfile } from "../../auth/google/profile";
import { IonProfile } from "../../auth/ion/profile";
import { nextId } from "../../lib/snowflakeId";

export interface User {
  id: number; // A string of digits
  email: string;
  verified_email: boolean;
  name: string; // This is the full name
  given_name: string; // In most of Europe, this is the first name, e.g. John
  family_name: string; // In most of Europe, this is the last name, e.g. Cena
  picture: string; // URL to a profile photo
  locale: "en"; // The user's preferred language
}

export async function doesUserExistWithEmail(email: string) {
  const db = await getDatabaseConnection();
  return new Promise<boolean>((resolve, reject) => {
    db.query(
      "SELECT 1 FROM `users` WHERE `email` = ?",
      [email],
      (err, results) => {
        if (err) reject(err);

        resolve(results.length > 0);
      }
    );
  });
}

/**
 * Function to ensure that all users exist
 * @param userIds The set of user ids to check
 */
export async function doAllUsersExistWithIds(
  userIds: Set<number>
): Promise<boolean> {
  const results = await Promise.all(
    Array.from(userIds).map((userId) => {
      return doesUserExistWithId(userId);
    })
  );

  return results.every((exists) => exists);
}

export async function doesUserExistWithId(id: number) {
  const db = await getDatabaseConnection();
  return new Promise<boolean>((resolve, reject) => {
    db.query("SELECT 1 FROM `users` WHERE `id` = ?", [id], (err, results) => {
      if (err) reject(err);

      resolve(results.length > 0);
    });
  });
}

export async function getUserFromEmail(email: string): Promise<User | null> {
  const db = await getDatabaseConnection();

  if (email in userFromEmailCache) {
    let timeSinceCacheUpdate =
      Date.now() - userFromEmailCache[email].updateTime;
    if (timeSinceCacheUpdate < MAX_CACHE_AGE) {
      return new Promise((resolve) => resolve(userFromEmailCache[email].user));
    }
  }

  return new Promise((resolve, reject) => {
    db.query(
      "SELECT * FROM `users` WHERE `email` = ?",
      [email],
      (error, results) => {
        if (error) {
          reject(error);
        } else {
          if (results.length > 0) {
            let user = results[0];
            userFromEmailCache[email] = { updateTime: Date.now(), user };
            resolve(user);
          } else {
            resolve(null);
          }
        }
      }
    );
  });
}

const userFromIdCache: {
  [id: number]: { updateTime: number; user: User };
} = {};

const userFromEmailCache: {
  [email: string]: { updateTime: number; user: User };
} = {};

const MAX_CACHE_AGE = 3600;

export async function getUserFromId(id: number): Promise<User | null> {
  const db = await getDatabaseConnection();

  if (id in userFromIdCache) {
    let timeSinceCacheUpdate = Date.now() - userFromIdCache[id].updateTime;
    if (timeSinceCacheUpdate < MAX_CACHE_AGE) {
      return new Promise((resolve) => resolve(userFromIdCache[id].user));
    }
  }

  return new Promise((resolve, reject) => {
    db.query("SELECT * FROM `users` WHERE `id` = ?", [id], (error, results) => {
      if (error) {
        reject(error);
      } else {
        if (results.length > 0) {
          let user = results[0];
          userFromIdCache[id] = { updateTime: Date.now(), user };
          resolve(user);
        } else {
          resolve(null);
        }
      }
    });
  });
}

/**
 * Returns the ID of the newly-created user
 */
export async function registerFromIonProfile(profile: IonProfile) {
  const db = await getDatabaseConnection();

  let id = nextId();

  return new Promise<number>((resolve, reject) => {
    db.query(
      "INSERT INTO `users` (`id`, `email`, `verifiedEmail`, `name`, `givenName`, `familyName`, `picture`, `locale`) values (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        id,
        profile.tj_email,
        true,
        profile.display_name,
        profile.first_name,
        profile.last_name,
        null, // profile.picture, (( This property doesn't work correctly on Ion ))
        "en", // Assume "en" because Ion is used at TJ
      ],
      (error) => {
        if (error) {
          reject(error);
        } else {
          resolve(id);
        }
      }
    );
  });
}

export async function registerFromGoogleProfile(profile: GoogleProfile) {
  const db = await getDatabaseConnection();

  let id = nextId();

  return new Promise<number>((resolve, reject) => {
    db.query(
      "INSERT INTO `users` (`id`, `email`, `verified_email`, `name`, `given_name`, `family_name`, `picture`, `locale`) values (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        id,
        profile.email,
        profile.verified_email,
        profile.name,
        profile.given_name,
        profile.family_name,
        profile.picture,
        profile.locale,
      ],
      (error) => {
        if (error) {
          reject(error);
        } else {
          resolve(id);
        }
      }
    );
  });
}
