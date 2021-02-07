import { Cluster } from "cluster";
import { db } from "..";
import getFirst from "../../lib/getFirst";
import prepareStatement from "../../lib/prepareStatement";
import { nextID } from "../../lib/snowflakeID";
import { getConnectionCount } from "../../spaces/server";
import { doesClusterExist } from "./clusters";
import { getPublicUserFromID } from "./users";
import { PublicUserInfo } from "./user_relations";

export type SpaceSessionVisibility = "discoverable" | "unlisted" | "secret";

export interface SpaceSession {
  id: string;
  name: string;
  start_time: string;
  stop_time: string;
  cluster_id?: string;
  host_id: string;
  host?: PublicUserInfo;
  visibility: SpaceSessionVisibility;
}

export async function startSpaceSession(
  hostID: string,
  topic: string,
  visibility: SpaceSessionVisibility,
  clusterID: string | null = null
): Promise<string> {
  if (clusterID != null) {
    const clusterExists = await doesClusterExist(clusterID);
    if (!clusterExists) {
      throw new Error("Cluster does not exist: " + clusterID);
    }
  }

  const id = nextID();

  await db.query(
    `INSERT INTO "space_sessions" ("id", "topic", "cluster_id", "host_id", "visibility") VALUES ($1, $2, $3, $4, $5)`,
    [id, topic, clusterID, hostID, visibility]
  );

  return id.toString();
}

/**
 *
 * @param id The space
 * @return The ID of the cluster that has the space
 */
export async function getClusterThatHasSpaceWithID(
  id: string
): Promise<Cluster> {
  let result = await db.query<Cluster>(
    `SELECT "clusters".* FROM "space_sessions" INNER JOIN "clusters" ON "clusters"."id" = "space_sessions"."cluster_id" WHERE "id" = $1 LIMIT 1`,
    [id]
  );

  return getFirst(result.rows);
}

export async function getActiveSpaceSessionsInCluster(
  clusterID: string
): Promise<SpaceSession[]> {
  let results = await db.query<SpaceSession>(
    `SELECT * FROM "space_sessions" WHERE "cluster_id" = $1 AND "stop_time" = NULL`,
    [clusterID]
  );

  return results.rows.map((space) => ({
    ...space,
    online_count: getConnectionCount(space.id),
  }));
}

export async function doesSpaceSessionExist(id: string) {
  let result = await db.query(
    `SELECT 1 FROM "space_sessions" WHERE "id" = $1 LIMIT 1`,
    [id]
  );

  return result.rowCount > 0;
}

export async function getSpaceSessionByID(
  id: string,
  fetchHostData: boolean
): Promise<SpaceSession> {
  let result = await db.query<SpaceSession>(
    `SELECT * FROM "space_sessions" WHERE "id" = $1 LIMIT 1`,
    [id]
  );

  if (result.rowCount === 0) {
    return null;
  }

  let spaceSession = result.rows[0];

  if (fetchHostData) {
    let user = await getPublicUserFromID(spaceSession.host_id);
    spaceSession.host = user;
  }

  return spaceSession;
}

export const setSpaceSessionName = prepareStatement<
  void,
  { name: string; id: string }
>(`UPDATE "space_sessions" SET "name" = $1 WHERE "id" = $2`, {
  name: 1,
  id: 2,
});

const deleteSpaceSession = prepareStatement<void, { id: string }>(
  `DELETE FROM "space_sessions" WHERE "id" = $1`,
  { id: 1 }
);
