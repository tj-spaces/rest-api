import { getDatabaseConnection } from "..";
import { nextId } from "../../lib/snowflakeId";

export type SpaceVisibility = "public" | "unlisted";

export interface Space {
  id: number;
  creator_id: number;
  name: string;
  created_at: string;
  updated_at: string;
  visibility: SpaceVisibility;
}

export async function createSpace(
  creatorId: number,
  name: string,
  visibility: SpaceVisibility
) {
  const db = await getDatabaseConnection();
  const id = nextId();
  return new Promise<number>((resolve, reject) => {
    db.query(
      "INSERT INTO `spaces` (`id`, `creator_id`, `name`, `visibility`) VALUES (?, ?, ?, ?, ?)",
      [id, creatorId, name, visibility],
      (err) => {
        if (err) reject(err);
        resolve(id);
      }
    );
  });
}

export async function doesSpaceExist(id: number) {
  const db = await getDatabaseConnection();
  return new Promise<boolean>((resolve, reject) => {
    db.query("SELECT 1 FROM `spaces` WHERE `id` = ?", [id], (err, results) => {
      if (err) reject(err);

      resolve(results.length > 0);
    });
  });
}

export async function getSpaceById(id: number) {
  const db = await getDatabaseConnection();
  return new Promise<Space | null>((resolve, reject) => {
    db.query("SELECT * FROM `spaces` WHERE `id` = ?", [id], (err, results) => {
      if (err) reject(err);
      if (results.length === 0) resolve(null);
      else resolve(results[0]);
    });
  });
}

export async function getSpacesCreatedByUser(creatorId: number) {
  const db = await getDatabaseConnection();
  return new Promise<Space[]>((resolve, reject) => {
    db.query(
      "SELECT * FROM `spaces` WHERE `creator_id` = ?",
      [creatorId],
      (err, results) => {
        if (err) reject(err);
        resolve(results);
      }
    );
  });
}

export async function setSpaceName(id: number, newName: string) {
  const db = await getDatabaseConnection();
  return new Promise<void>((resolve, reject) => {
    db.query(
      "UPDATE `spaces` SET `name` = ?, `updated_on` = CURRENT_TIMESTAMP WHERE `id` = ?",
      [newName, id],
      (err) => {
        if (err) reject(err);
        resolve();
      }
    );
  });
}

/**
 * Returns all spaces that have a visibility of 'public'.
 */
export async function getPublicSpaces() {
  const db = await getDatabaseConnection();
  return new Promise<Space[]>((resolve, reject) => {
    db.query(
      "SELECT * FROM `spaces` WHERE `visibility` = 'public'",
      [],
      (err, result) => {
        if (err) reject(err);
        resolve(result);
      }
    );
  });
}

export async function setSpaceVisibility(
  id: number,
  newVisibility: SpaceVisibility
) {
  const db = await getDatabaseConnection();
  return new Promise<void>((resolve, reject) => {
    db.query(
      "UPDATE `spaces` SET `visibility` = ?, `updated_on` = CURRENT_TIMESTAMP WHERE `id` = ?",
      [newVisibility, id],
      (err) => {
        if (err) reject(err);
        resolve();
      }
    );
  });
}

export async function deleteSpace(id: number) {
  const db = await getDatabaseConnection();
  return new Promise<void>((resolve, reject) => {
    db.query("DELETE FROM `spaces` WHERE `id` = ?", [id], (err) => {
      if (err) reject(err);
      resolve();
    });
  });
}
