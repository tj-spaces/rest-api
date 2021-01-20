import { getDatabaseConnection } from "..";
import createUuid from "../../lib/createUuid";

export interface Message {
  id: string;
  channel_id: string;
  sender_id: string; // references users
  content: string;
  sent_at: string;
  edited_at: string;
  was_unsent: boolean;
}

export async function createMessage(
  channelId: string,
  senderId: string,
  content: string
) {
  const db = await getDatabaseConnection();
  const id = createUuid();

  return new Promise<string>((resolve, reject) => {
    db.query(
      "INSERT INTO `messages` (id, channel_id, sender_id, content) VALUES (?, ?, ?, ?)",
      [id, channelId, senderId, content],
      (err) => {
        if (err) reject(err);
        resolve(id);
      }
    );
  });
}

/**
 * Marks a message as unsent, so the content is not send with the message when it goes to the client
 * @param id The message to unsend
 */
export async function unsendMessage(id: string) {
  const db = await getDatabaseConnection();

  return new Promise<void>((resolve, reject) => {
    db.query(
      "UPDATE `messages` SET `was_unsent` = 1 WHERE `id` = ?",
      [id],
      (err) => {
        if (err) reject(err);
        resolve();
      }
    );
  });
}

export async function getMessage(id: string) {
  const db = await getDatabaseConnection();

  return new Promise<Message | null>((resolve, reject) => {
    db.query(
      "SELECT * FROM `messages` WHERE `id` = ?",
      [id],
      (err, results) => {
        if (err) reject(err);
        if (results.length === 0) resolve(null);
        else resolve(results[0]);
      }
    );
  });
}

export async function getMessageHideUnsent(id: string) {
  const message = await getMessage(id);

  if (message.was_unsent) {
    message.content = "";
  }

  return message;
}

export async function getMessagesInChannel(channelId: string) {
  const db = await getDatabaseConnection();

  return new Promise<Message[]>((resolve, reject) => {
    db.query(
      "SELECT * FROM `messages` WHERE `channel_id` = ?",
      [channelId],
      (err, results) => {
        if (err) reject(err);
        resolve(results);
      }
    );
  });
}
