import { getDatabaseConnection } from "../index";
import createUuid from "lib/createUuid";
import { GoogleProfile } from "auth/google/profile";
import { IonProfile } from "auth/ion/profile";

export interface User {
  id: string; // A string of digits
  email: string;
  verifiedEmail: boolean;
  name: string; // This is the full name
  givenName: string; // In most of Europe, this is the first name, e.g. John
  familyName: string; // In most of Europe, this is the last name, e.g. Cena
  picture: string; // URL to a profile photo
  locale: "en"; // The user's preferred language
}

export async function getUserFromEmail(email: string): Promise<User | null> {
  const db = getDatabaseConnection();

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
  [id: string]: { updateTime: number; user: User };
} = {};

const userFromEmailCache: {
  [email: string]: { updateTime: number; user: User };
} = {};

const MAX_CACHE_AGE = 3600;

export async function getUserFromId(id: string): Promise<User | null> {
  const db = getDatabaseConnection();

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

export async function registerFromIonProfile(profile: IonProfile) {
  const db = getDatabaseConnection();

  let id = createUuid();

  return new Promise<{ id: string }>((resolve, reject) => {
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
          resolve({ id });
        }
      }
    );
  });
}

export async function registerFromGoogleProfile(profile: GoogleProfile) {
  const db = getDatabaseConnection();

  let id = createUuid();

  return new Promise<{ id: string }>((resolve, reject) => {
    db.query(
      "INSERT INTO `users` (`id`, `email`, `verifiedEmail`, `name`, `givenName`, `familyName`, `picture`, `locale`) values (?, ?, ?, ?, ?, ?, ?, ?)",
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
          resolve({ id });
        }
      }
    );
  });
}
