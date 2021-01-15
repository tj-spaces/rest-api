import { getDatabaseConnection } from "..";

interface SpaceChannel {
  channel_id: number;
  space_id: number;
}

/**
 *
 * @param channelId The channel
 * @return The ID of the space that has the channel
 */
export async function getSpaceThatHasChannel(
  channelId: number
): Promise<number> {
  const db = await getDatabaseConnection();
  return new Promise<number>((resolve, reject) => {
    db.query(
      "SELECT `space_id` FROM `space_channels` WHERE `channel_id` = ?",
      [channelId],
      (err, results: SpaceChannel[]) => {
        if (err) reject(err);
        else {
          if (results.length === 0) {
            resolve(null);
          } else {
            resolve(results[0].space_id);
          }
        }
      }
    );
  });
}

export async function getChannelsInSpace(spaceId: number): Promise<string[]> {
  const db = await getDatabaseConnection();
  return new Promise<string[]>((resolve, reject) => {
    db.query(
      "SELECT `channel_id` FROM `space_channels` WHERE `space_id` = ?",
      [spaceId],
      (err, result) => {
        if (err) reject(err);
        resolve(result.map((row: SpaceChannel) => row.channel_id));
      }
    );
  });
}
