import { getDatabaseConnection } from "..";
import createUuid from "../../lib/createUuid";

/**
 * This just stores the id of the channel, the name, and the channel color.
 * Maybe we'll add the ability to lock channels in the future.
 * For now, all channels are both text AND voice channels
 */
export interface Channel {
  id: string;
  name: string;
  color: string;
}

/**
 * @return Channel id
 */
export async function createChannel(name: string, color: string) {
  const db = await getDatabaseConnection();
  const id = createUuid();
  return new Promise<string>((resolve, reject) => {
    db.query(
      "INSERT INTO `channels` (`id`, `name`, `color`) VALUES (?, ?, ?)",
      [id, name, color],
      (err) => {
        if (err) reject(err);
        else resolve(id);
      }
    );
  });
}

export async function getChannelById(id: string) {
  const db = await getDatabaseConnection();
  return new Promise<Channel | null>((resolve, reject) => {
    db.query(
      "SELECT * FROM `channels` WHERE `id` = ?",
      [id],
      (err, results) => {
        if (err) reject(err);
        if (results.length === 0) resolve(null);
        else resolve(results[0]);
      }
    );
  });
}

export async function setChannelName(id: string, newName: string) {
  const db = await getDatabaseConnection();
  return new Promise<void>((resolve, reject) => {
    db.query(
      "UPDATE `channels` SET `name` = ? WHERE `id` = ?",
      [newName, id],
      (err) => {
        if (err) reject(err);
        resolve();
      }
    );
  });
}

export async function setChannelColor(id: string, newColor: string) {
  const db = await getDatabaseConnection();
  return new Promise<void>((resolve, reject) => {
    db.query(
      "UPDATE `channels` SET `color` = ? WHERE `id` = ?",
      [newColor, id],
      (err) => {
        if (err) reject(err);
        resolve();
      }
    );
  });
}

export async function deleteChannel(id: string) {
  const db = await getDatabaseConnection();
  return new Promise<void>((resolve, reject) => {
    db.query("DELETE FROM `channels` WHERE `id` = ?", [id], (err) => {
      if (err) reject(err);
      resolve();
    });
  });
}
