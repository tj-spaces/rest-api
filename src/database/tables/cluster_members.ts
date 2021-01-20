import { getDatabaseConnection } from "..";
import { Cluster, doesClusterExist } from "./clusters";
import { doesUserExistWithId } from "./users";

export interface ClusterMember {
  cluster_id: string;
  user_id: string;
}

export async function joinCluster(
  clusterId: string,
  userId: string,
  skipCheck: boolean = false
) {
  if (!skipCheck) {
    if (!(await doesClusterExist(clusterId))) {
      throw new Error("Cluster does not exist with id: " + clusterId);
    } else if (!(await doesUserExistWithId(userId))) {
      throw new Error("User does not exist with id: " + userId);
    }
  }

  const db = await getDatabaseConnection();
  return new Promise<void>((resolve, reject) => {
    db.query(
      "INSERT INTO `cluster_members` (`cluster_id`, `user_id`) VALUES (?, ?)",
      [clusterId, userId],
      (err) => {
        if (err) reject(err);
        resolve();
      }
    );
  });
}

export async function didUserJoinCluster(clusterId: string, userId: string) {
  const db = await getDatabaseConnection();

  return new Promise<boolean>((resolve, reject) => {
    db.query(
      "SELECT 1 FROM `cluster_members` WHERE `cluster_id` = ? AND `user_id` = ?",
      [clusterId, userId],
      (err, results) => {
        if (err) reject(err);
        resolve(results.length > 0);
      }
    );
  });
}

/**
 * Get a list of which clusters a user has joined.
 * Returns an array of strings, which are ClusterIds.
 * @param userId The user
 */
export async function getClustersWithUser(userId: string) {
  const db = await getDatabaseConnection();
  return new Promise<Cluster[]>((resolve, reject) => {
    db.query(
      "SELECT `clusters`.*\
       FROM `cluster_members`\
       INNER JOIN `clusters` ON `clusters`.`id` = `cluster_members`.`cluster_id`\
       WHERE `cluster_members`.`user_id` = ?",
      [userId],
      (err, results) => {
        if (err) reject(err);
        else {
          // results = Cluster[]
          resolve(results);
        }
      }
    );
  });
}

/**
 * Get a list of the members of a cluster.
 * Returns an array of strings, which are UserIDs.
 * @param userId The user
 */
export async function getUsersInCluster(clusterId: string) {
  const db = await getDatabaseConnection();
  return new Promise<string[]>((resolve, reject) => {
    db.query(
      "SELECT user_id FROM `cluster_members` WHERE `cluster_id` = ?",
      [clusterId],
      (err, result) => {
        if (err) reject(err);
        resolve(result.map((row: ClusterMember) => row.user_id));
      }
    );
  });
}

export async function deleteUserFromCluster(clusterId: string, userId: string) {
  const db = await getDatabaseConnection();
  return new Promise<void>((resolve, reject) => {
    db.query(
      "DELETE FROM `cluster_members` WHERE `cluster_id` = ? AND `user_id` = ?",
      [clusterId, userId],
      (err) => {
        if (err) reject(err);
        resolve();
      }
    );
  });
}
