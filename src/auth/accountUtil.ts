import { getDatabaseConnection } from "../database";
import { User } from "../database/tables/users";
import createUuid from "../lib/createUuid";
import { GoogleProfile } from "../profile/googleProfile";
import { IonProfile } from "../profile/ionProfile";

export async function getUserFromEmail(email: string): Promise<User | null> {
  const db = getDatabaseConnection();

  return new Promise((resolve, reject) => {
    db.query(
      "SELECT * FROM `users` WHERE `email` = ?",
      [email],
      (error, results, fields) => {
        if (error) {
          reject(error);
        } else {
          resolve(results.length > 0 ? results[0] : null);
        }
      }
    );
  });
}

export async function getUserFromId(id: string): Promise<User | null> {
  const db = getDatabaseConnection();

  return new Promise((resolve, reject) => {
    db.query(
      "SELECT * FROM `users` WHERE `id` = ?",
      [id],
      (error, results, fields) => {
        if (error) {
          reject(error);
        } else {
          resolve(results.length > 0 ? results[0] : null);
        }
      }
    );
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
