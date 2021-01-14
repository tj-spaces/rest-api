import { getDatabaseConnection } from "..";
import createUuid from "../../lib/createUuid";

export default interface Space {
  id: string;
  creator_id: string;
  name: string;
  created_on: string;
  updated_on: string;
}

export async function createSpace(creator_id: string, name: string) {
  const db = await getDatabaseConnection();
  const id = createUuid();
  return new Promise<string>((resolve, reject) => {
    db.query(
      "INSERT INTO `spaces` (`id`, `creator_id`, `name`) VALUES (?, ?, ?)",
      [id, creator_id, name],
      (err) => {
        if (err) reject(err);
        resolve(id);
      }
    );
  });
}

export async function setSpaceName(id: string, newName: string) {
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

export async function deleteSpace(id: string) {
  const db = await getDatabaseConnection();
  return new Promise<void>((resolve, reject) => {
    db.query("DELETE FROM `spaces` WHERE `id` = ?", [id], (err) => {
      if (err) reject(err);
      resolve();
    });
  });
}
