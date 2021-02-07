import { db } from "..";
import getFirst from "../../lib/getFirst";
import { nextID } from "../../lib/snowflakeID";

export type ClusterVisibility = "discoverable" | "unlisted" | "secret";

export interface Cluster {
  id: string;
  creator_id: string;
  name: string;
  created_at: string;
  visibility: ClusterVisibility;
}

export async function createCluster(
  creatorID: string,
  name: string,
  visibility: ClusterVisibility
) {
  const id = nextID();
  await db.query(
    `INSERT INTO "clusters" ("id", "creator_id", "name", "visibility") VALUES ($1, $2, $3, $4)`,
    [id, creatorID, name, visibility]
  );
  return id.toString();
}

export async function doesClusterExist(id: string) {
  let results = await db.query(
    `SELECT 1 FROM "clusters" WHERE "id" = $1 LIMIT 1`,
    [id]
  );

  return results.rowCount > 0;
}

export async function getClusterByID(id: string) {
  let results = await db.query(
    `SELECT * FROM "clusters" WHERE "id" = $1 LIMIT 1`,
    [id]
  );

  return getFirst(results.rows);
}

export async function getClustersCreatedByUser(creatorID: string) {
  let results = await db.query(
    `SELECT * FROM "clusters" WHERE "creator_id" = $1`,
    [creatorID]
  );

  return results.rows;
}

export async function setClusterName(id: string, name: string) {
  await db.query(`UPDATE "clusters" SET "name" = $1 WHERE "id" = $1`, [
    name,
    id,
  ]);
}

/**
 * Returns all clusters that have a visibility of 'public'.
 */
export async function getPublicClusters() {
  let results = await db.query(
    `SELECT * FROM "clusters" WHERE "visibility" = 'discoverable'`,
    []
  );

  return results.rows;
}

export async function setClusterVisibility(
  id: string,
  visibility: ClusterVisibility
) {
  await db.query(
    `UPDATE "clusters" SET "visibility" = $1, "updated_on" = CURRENT_TIMESTAMP WHERE "id" = $2`,
    [visibility, id]
  );
}

export async function deleteCluster(id: string) {
  await db.query(`DELETE FROM "clusters" WHERE "id" = $1`, [id]);
}
