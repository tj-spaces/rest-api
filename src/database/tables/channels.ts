import { getDatabaseConnection } from "..";
import { nextId } from "../../lib/snowflakeId";
import { doesSpaceExist } from "./spaces";

/**
 * This just stores the id of the channel, the name, and the channel color.
 * Maybe we'll add the ability to lock channels in the future.
 * For now, all channels are both text AND voice channels
 */
export type Channel = {
  id: number;
  name: string;
  color: string;
} & (
  | {
      type: "direct";
      user_a_id: number;
      user_b_id: number;
    }
  | {
      type: "group";
      group_id: number;
    }
  | {
      type: "space";
      space_id: number;
    }
);

/**
 * @return Channel id
 */
async function createChannel(name: string, color: string): Promise<number> {
  const db = await getDatabaseConnection();
  const id = nextId();
  return new Promise<number>((resolve, reject) => {
    db.query(
      "INSERT INTO `channels` (`id`, `name`, `color`) VALUES (?, ?, ?)",
      [id, name, color],
      (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(id);
        }
      }
    );
  });
}

export async function createChannelInSpace(
  spaceId: number,
  name: string,
  color: string
): Promise<number> {
  const channelId = await createChannel(name, color);
  const db = await getDatabaseConnection();

  if (!doesSpaceExist(spaceId)) {
    throw new Error("Space does not exist: " + spaceId);
  }

  return new Promise<number>((resolve, reject) => {
    db.query(
      "INSERT INTO `space_channels` (`space_id`, `channel_id`) VALUES (?, ?)",
      [spaceId, channelId],
      (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(channelId);
        }
      }
    );
  });
}

/**
 *
 * @param id The channel
 * @return The ID of the space that has the channel
 */
export async function getSpaceThatHasChannelWithId(
  id: number
): Promise<number> {
  const db = await getDatabaseConnection();
  return new Promise<number>((resolve, reject) => {
    db.query(
      "SELECT `space_id` FROM `channels` WHERE `type` = 'space' AND `id` = ?",
      [id],
      (err, results: Channel[]) => {
        if (err) reject(err);
        else {
          if (results.length === 0) {
            resolve(null);
          } else {
            // @ts-ignore
            resolve(results[0].space_id);
          }
        }
      }
    );
  });
}

export async function getChannelsInSpace(spaceId: number): Promise<number[]> {
  const db = await getDatabaseConnection();

  return await new Promise<number[]>((resolve, reject) => {
    db.query(
      "SELECT `id` FROM `channels` WHERE `type` = 'space' AND `space_id` = ?",
      [spaceId],
      (err, result) => {
        if (err) reject(err);

        resolve(result.map((row: Channel) => row.id));
      }
    );
  });
}

export async function getChannelById(id: number) {
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

export async function setChannelName(id: number, newName: string) {
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

export async function setChannelColor(id: number, newColor: string) {
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

export async function deleteChannel(id: number) {
  const db = await getDatabaseConnection();
  return new Promise<void>((resolve, reject) => {
    db.query("DELETE FROM `channels` WHERE `id` = ?", [id], (err) => {
      if (err) reject(err);
      resolve();
    });
  });
}
