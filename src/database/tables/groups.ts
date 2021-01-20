import { getDatabaseConnection } from "..";
import createUuid from "../../lib/createUuid";
import { doAllUsersExistWithIds } from "./users";

export interface Group {
  id: string;
  name?: string;
  picture?: string;
}

export async function doesGroupExistWithId(id: string): Promise<boolean> {
  const db = await getDatabaseConnection();

  return await new Promise<boolean>((resolve, reject) => {
    db.query("SELECT 1 FROM `groups` WHERE `id` = ?", [id], (err, results) => {
      if (err) reject(err);
      resolve(results.length > 0);
    });
  });
}

/**
 *
 * @param memberUserIds The set of user ids to add to the group
 */
export async function createGroup(memberUserIds: Set<string>): Promise<string> {
  if (memberUserIds.size < 3) {
    throw new Error(
      "Not enough users in group; create a Direct Message instead"
    );
  }

  // Ensure that all user ids are valid users
  const allUsersExist = await doAllUsersExistWithIds(memberUserIds);
  if (!allUsersExist) {
    throw new Error("Not all users exist in group creation");
  }

  const db = await getDatabaseConnection();
  const groupId = createUuid();

  return await new Promise<string>((resolve, reject) =>
    db.query("INSERT INTO `groups` (`id`) VALUES (?)", [groupId], (err) => {
      if (err) reject(err);
      else {
        const insertGroupMembers = Promise.all(
          Array.from(memberUserIds).map((userId) => {
            // Create a query to add this user to the group
            return new Promise<void>((resolve, reject) => {
              db.query(
                "INSERT INTO `group_members` (`group_id`, `user_id`) VALUES (?, ?)",
                [groupId, userId],
                (err) => {
                  if (err) reject(err);
                  else resolve();
                }
              );
            });
          })
        );

        insertGroupMembers
          .then(() => resolve(groupId))
          .catch((err) => reject(err));
      }
    })
  );
}

export async function getGroup(id: string): Promise<Group | null> {
  const db = await getDatabaseConnection();

  return await new Promise<Group | null>((resolve, reject) => {
    db.query("SELECT * FROM `groups` WHERE `id` = ?", [id], (err, results) => {
      if (err) reject(err);
      if (results.length === 0) resolve(null);
      else resolve(results[0]);
    });
  });
}
