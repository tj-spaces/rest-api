import { db } from "..";
import { Cluster, doesClusterExist } from "./clusters";
import { doesUserExistWithID } from "./users";

export interface ClusterMember {
  cluster_id: string;
  user_id: string;
}

export async function joinCluster(
  clusterID: string,
  userID: string,
  skipCheck: boolean = false
) {
  if (!skipCheck) {
    if (!(await doesClusterExist(clusterID))) {
      throw new Error("Cluster does not exist with id: " + clusterID);
    } else if (!(await doesUserExistWithID(userID))) {
      throw new Error("User does not exist with id: " + userID);
    }
  }

  await db.query(
    `INSERT INTO "cluster_members" ("cluster_id", "user_id") VALUES ($1, $2)`,
    [clusterID, userID]
  );
}

export async function didUserJoinCluster(
  clusterID: string,
  userID: string
): Promise<boolean> {
  let results = await db.query(
    `SELECT 1 FROM "cluster_members" WHERE "cluster_id" = $1 AND "user_id" = $2 LIMIT 1`,
    [clusterID, userID]
  );

  return results.rowCount > 0;
}

/**
 * Get a list of which clusters a user has joined.
 * Returns an array of strings, which are ClusterIDs.
 * @param userID The user
 */
export async function getClustersWithUser(userID: string) {
  let results = await db.query(
    `SELECT "clusters".*
       FROM "cluster_members"
       INNER JOIN "clusters" ON "clusters"."id" = "cluster_members"."cluster_id"
       WHERE "cluster_members"."user_id" = $1`,
    [userID]
  );

  return results.rows;
}

/**
 * Get a list of the members of a cluster.
 * Returns an array of strings, which are UserIDs.
 * @param userID The user
 */
export async function getUsersInCluster(clusterID: string) {
  let results = await db.query(
    `SELECT user_id FROM "cluster_members" WHERE "cluster_id" = $1`,
    [clusterID]
  );

  return results.rows.map((row: ClusterMember) => row.user_id);
}

export async function deleteUserFromCluster(clusterID: string, userID: string) {
  await db.query(
    `DELETE FROM "cluster_members" WHERE "cluster_id" = $1 AND "user_id" = $2`,
    [clusterID, userID]
  );
}
