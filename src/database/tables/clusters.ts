import { db } from "..";
import { nextId } from "../../lib/snowflakeId";

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
  const id = nextId();
  return new Promise<string>((resolve, reject) => {
    db.query(
      `INSERT INTO "clusters" ("id", "creator_id", "name", "visibility") VALUES ($1, $2, $3, $4)`,
      [id, creatorID, name, visibility],
      (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(id.toString());
        }
      }
    );
  });
}

export async function doesClusterExist(id: string) {
  return new Promise<boolean>((resolve, reject) => {
    db.query(
      `SELECT 1 FROM "clusters" WHERE "id" = $1 LIMIT 1`,
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

export async function getClusterById(id: string) {
  return new Promise<Cluster | null>((resolve, reject) => {
    db.query(
      `SELECT * FROM "clusters" WHERE "id" = $1 LIMIT 1`,
      [id],
      (err, results) => {
        if (err) {
          reject(err);
        } else if (results.rowCount === 0) {
          resolve(null);
        } else {
          resolve(results.rows[0]);
        }
      }
    );
  });
}

export async function getClustersCreatedByUser(creatorID: string) {
  return new Promise<Cluster[]>((resolve, reject) => {
    db.query(
      `SELECT * FROM "clusters" WHERE "creator_id" = $1`,
      [creatorID],
      (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results.rows);
        }
      }
    );
  });
}

export async function setClusterName(id: string, name: string) {
  return new Promise<void>((resolve, reject) => {
    db.query(
      `UPDATE "clusters" SET "name" = $1 WHERE "id" = $1`,
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

/**
 * Returns all clusters that have a visibility of 'public'.
 */
export async function getPublicClusters() {
  return new Promise<Cluster[]>((resolve, reject) => {
    db.query(
      `SELECT * FROM "clusters" WHERE "visibility" = 'discoverable'`,
      [],
      (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result.rows);
        }
      }
    );
  });
}

export async function setClusterVisibility(
  id: string,
  visibility: ClusterVisibility
) {
  return new Promise<void>((resolve, reject) => {
    db.query(
      `UPDATE "clusters" SET "visibility" = $1, "updated_on" = CURRENT_TIMESTAMP WHERE "id" = $2`,
      [visibility, id],
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

export async function deleteCluster(id: string) {
  return new Promise<void>((resolve, reject) => {
    db.query(`DELETE FROM "clusters" WHERE "id" = $1`, [id], (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}
