import { db } from "..";
import createUuid from "../../lib/createUuid";
import { getConnectionCount } from "../../spaces/server";
import { doesClusterExist } from "./clusters";

/**
 * This just stores the id of the cluster, the name, and the theme color.
 * Maybe we'll add the ability to lock clusters in the future.
 * For now, all clusters have their own group chat and voice chat built in
 */
export interface SpaceSession {
  id: string;
  name: string;
  start_time: string;
  stop_time: string;
  cluster_id?: string;
  host_id: string;
}

export async function startSpaceSessionInCluster(
  hostID: string,
  clusterID: string,
  name: string
): Promise<string> {
  const clusterExists = await doesClusterExist(clusterID);
  if (!clusterExists) {
    throw new Error("Cluster does not exist: " + clusterID);
  }

  const id = createUuid();
  return new Promise<string>((resolve, reject) => {
    db.query(
      `INSERT INTO "spaces" ("id", "name", "cluster_id", "host_id") VALUES ($1, $2, $3, $4)`,
      [id, name, clusterID, hostID],
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

/**
 *
 * @param id The space
 * @return The ID of the cluster that has the space
 */
export async function getClusterThatHasSpaceWithId(
  id: string
): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    db.query<SpaceSession>(
      `SELECT "cluster_id" FROM "spaces" WHERE "id" = $1`,
      [id],
      (err, results) => {
        if (err) {
          reject(err);
        } else {
          if (results.rowCount === 0) {
            resolve(null);
          } else {
            resolve(results.rows[0].cluster_id);
          }
        }
      }
    );
  });
}

export async function getActiveSpaceSessionsInCluster(
  clusterID: string
): Promise<SpaceSession[]> {
  return await new Promise<SpaceSession[]>((resolve, reject) => {
    db.query<SpaceSession>(
      `SELECT * FROM "spaces" WHERE "cluster_id" = $1 AND "stop_time" = NULL`,
      [clusterID],
      (err, results) => {
        if (err) {
          reject(err);
        } else {
          const withOnlineCount = results.rows.map((space) => ({
            ...space,
            online_count: getConnectionCount(space.id),
          }));
          resolve(withOnlineCount);
        }
      }
    );
  });
}

export async function doesSpaceExist(id: string) {
  return new Promise<boolean>((resolve, reject) => {
    db.query(
      `SELECT 1 FROM "spaces" WHERE "id" = $1 LIMIT 1`,
      [id],
      (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results.rowCount > 0);
        }
      }
    );
  });
}

export async function getSpaceById(id: string): Promise<SpaceSession | null> {
  return new Promise<SpaceSession | null>((resolve, reject) => {
    db.query(`SELECT * FROM "spaces" WHERE "id" = ?`, [id], (err, results) => {
      if (err) {
        reject(err);
      } else if (results.rowCount === 0) {
        resolve(null);
      } else {
        resolve(results.rows[0]);
      }
    });
  });
}

export async function setSpaceName(id: string, name: string) {
  return new Promise<void>((resolve, reject) => {
    db.query(
      `UPDATE "spaces" SET "name" = $1 WHERE "id" = $2`,
      [name, id],
      (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      }
    );
  });
}

export async function deleteSpace(id: string) {
  return new Promise<void>((resolve, reject) => {
    db.query(`DELETE FROM "spaces" WHERE "id" = $1`, [id], (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}
