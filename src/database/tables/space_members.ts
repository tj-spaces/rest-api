import { getDatabaseConnection } from "..";
import { doesSpaceExist } from "./spaces";
import { doesUserExistWithId } from "./users";

export interface SpaceMember {
  space_id: string;
  user_id: string;
}

export async function joinSpace(
  spaceId: string,
  userId: string,
  skipCheck: boolean = false
) {
  if (!skipCheck) {
    if (!(await doesSpaceExist(spaceId))) {
      throw new Error("Space does not exist with id: " + spaceId);
    } else if (!(await doesUserExistWithId(userId))) {
      throw new Error("User does not exist with id: " + userId);
    }
  }

  const db = await getDatabaseConnection();
  return new Promise<void>((resolve, reject) => {
    db.query(
      "INSERT INTO `space_members` (`space_id`, `user_id`) VALUES (?, ?)",
      [spaceId, userId],
      (err) => {
        if (err) reject(err);
        resolve();
      }
    );
  });
}

export async function isUserInSpace(spaceId: string, userId: string) {
  const db = await getDatabaseConnection();

  return new Promise<boolean>((resolve, reject) => {
    db.query(
      "SELECT 1 FROM `space_members` WHERE `space_id` = ? AND `user_id` = ?",
      [spaceId, userId],
      (err, results) => {
        if (err) reject(err);
        resolve(results.length > 0);
      }
    );
  });
}

/**
 * Get a list of which spaces a user has joined.
 * Returns an array of strings, which are SpaceIDs.
 * @param userId The user
 */
export async function getSpacesWithMember(userId: string) {
  const db = await getDatabaseConnection();
  return new Promise<string[]>((resolve, reject) => {
    db.query(
      "SELECT `spaces.*`\
       FROM `space_members`\
       INNER JOIN ON `spaces.id` = `space_members.space_id`\
       WHERE `space_members.user_id` = ?",
      [userId],
      (err, result) => {
        if (err) reject(err);
        resolve(result.map((row: SpaceMember) => row.space_id));
      }
    );
  });
}

/**
 * Get a list of the members of a space.
 * Returns an array of strings, which are UserIDs.
 * @param userId The user
 */
export async function getSpaceMembers(spaceId: string) {
  const db = await getDatabaseConnection();
  return new Promise<string[]>((resolve, reject) => {
    db.query(
      "SELECT user_id FROM `space_members` WHERE `space_id` = ?",
      [spaceId],
      (err, result) => {
        if (err) reject(err);
        resolve(result.map((row: SpaceMember) => row.user_id));
      }
    );
  });
}

export async function deleteSpaceMembership(spaceId: string, userId: string) {
  const db = await getDatabaseConnection();
  return new Promise<void>((resolve, reject) => {
    db.query(
      "DELETE FROM `space_members` WHERE `space_id` = ? AND `user_id` = ?",
      [spaceId, userId],
      (err) => {
        if (err) reject(err);
        resolve();
      }
    );
  });
}
