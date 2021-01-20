import { getDatabaseConnection } from "..";
import { doesGroupExistWithId } from "./groups";
import { doesUserExistWithId } from "./users";

export interface GroupMember {
  group_id: string;
  user_id: string;
}

export async function addGroupMember(
  groupId: string,
  userId: string
): Promise<void> {
  const groupExists = await doesGroupExistWithId(groupId);
  if (!groupExists) {
    throw new Error("Space does not exist with id: " + groupId);
  }

  const userExists = await doesUserExistWithId(userId);
  if (!userExists) {
    throw new Error("User does not exist with id: " + userId);
  }

  const db = await getDatabaseConnection();
  return await new Promise<void>((resolve, reject) => {
    db.query(
      "INSERT INTO `group_members` (`group_id`, `user_id`) VALUES (?, ?)",
      [groupId, userId],
      (err) => {
        if (err) reject(err);
        resolve();
      }
    );
  });
}

export async function isUserInGroup(
  groupId: string,
  userId: string
): Promise<boolean> {
  const db = await getDatabaseConnection();
  return await new Promise<boolean>((resolve, reject) => {
    db.query(
      "SELECT 1 FROM `group_members` WHERE `group_id` = ? AND `user_id` = ?",
      [groupId, userId],
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
export async function getUserJoinedGroups(userId: string) {
  const db = await getDatabaseConnection();
  return await new Promise<string[]>((resolve, reject) => {
    db.query(
      "SELECT `group_id` FROM `group_members` WHERE `user_id` = ?",
      [userId],
      (err, result) => {
        if (err) reject(err);
        resolve(result.map((row: GroupMember) => row.group_id));
      }
    );
  });
}

/**
 * Get a list of the members of a space.
 * Returns an array of strings, which are UserIDs.
 * @param userId The user
 */
export async function getGroupMembers(groupId: string) {
  const db = await getDatabaseConnection();
  return await new Promise<string[]>((resolve, reject) => {
    db.query(
      "SELECT `user_id` FROM `group_members` WHERE `group_id` = ?",
      [groupId],
      (err, result) => {
        if (err) reject(err);
        resolve(result.map((row: GroupMember) => row.user_id));
      }
    );
  });
}

export async function removeFromGroup(groupId: string, userId: string) {
  const db = await getDatabaseConnection();
  return await new Promise<void>((resolve, reject) => {
    db.query(
      "DELETE FROM `group_members` WHERE `group_id` = ? AND `user_id` = ?",
      [groupId, userId],
      (err) => {
        if (err) reject(err);
        resolve();
      }
    );
  });
}
