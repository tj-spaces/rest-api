import { getDatabaseConnection } from "..";
import { doesSpaceExist } from "./spaces";
import { doesUserExistWithId } from "./users";

export interface SpaceMember {
  space_id: number;
  user_id: number;
}

export async function createSpaceMember(
  spaceId: number,
  userId: number,
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

export async function doesSpaceMemberExist(spaceId: number, userId: number) {
  const db = await getDatabaseConnection();
  return new Promise<SpaceMember[]>((resolve, reject) => {
    db.query(
      "SELECT * FROM `space_members` WHERE `space_id` = ? AND `user_id` = ?",
      [spaceId, userId],
      (err, result) => {
        if (err) reject(err);
        resolve(result);
      }
    );
  });
}

/**
 * Get a list of which spaces a user has joined.
 * Returns an array of strings, which are SpaceIDs.
 * @param userId The user
 */
export async function getUserJoinedSpaces(userId: number) {
  const db = await getDatabaseConnection();
  return new Promise<string[]>((resolve, reject) => {
    db.query(
      "SELECT space_id FROM `space_members` WHERE `user_id` = ?",
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
export async function getSpaceMembers(spaceId: number) {
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

export async function deleteSpaceMembership(spaceId: number, userId: number) {
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
