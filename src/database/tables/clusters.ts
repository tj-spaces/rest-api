import { getDatabaseConnection } from "..";
import createUuid from "../../lib/createUuid";

export type ClusterVisibility = "public" | "unlisted";

export interface Cluster {
  id: string;
  creator_id: string;
  name: string;
  created_at: string;
  updated_at: string;
  visibility: ClusterVisibility;
}

export async function createCluster(
  creatorId: string,
  name: string,
  visibility: ClusterVisibility
) {
  const db = await getDatabaseConnection();
  const id = createUuid();
  return new Promise<string>((resolve, reject) => {
    db.query(
      "INSERT INTO `clusters` (`id`, `creator_id`, `name`, `visibility`) VALUES (?, ?, ?, ?, ?)",
      [id, creatorId, name, visibility],
      (err) => {
        if (err) reject(err);
        resolve(id);
      }
    );
  });
}

export async function doesClusterExist(id: string) {
  const db = await getDatabaseConnection();
  return new Promise<boolean>((resolve, reject) => {
    db.query(
      "SELECT 1 FROM `clusters` WHERE `id` = ?",
      [id],
      (err, results) => {
        if (err) reject(err);

        resolve(results.length > 0);
      }
    );
  });
}

export async function getClusterById(id: string) {
  const db = await getDatabaseConnection();
  return new Promise<Cluster | null>((resolve, reject) => {
    db.query(
      "SELECT * FROM `clusters` WHERE `id` = ?",
      [id],
      (err, results) => {
        if (err) reject(err);
        if (results.length === 0) resolve(null);
        else resolve(results[0]);
      }
    );
  });
}

export async function getClustersCreatedByUser(creatorId: string) {
  const db = await getDatabaseConnection();
  return new Promise<Cluster[]>((resolve, reject) => {
    db.query(
      "SELECT * FROM `clusters` WHERE `creator_id` = ?",
      [creatorId],
      (err, results) => {
        if (err) reject(err);
        resolve(results);
      }
    );
  });
}

export async function setClusterName(id: string, newName: string) {
  const db = await getDatabaseConnection();
  return new Promise<void>((resolve, reject) => {
    db.query(
      "UPDATE `clusters` SET `name` = ?, `updated_on` = CURRENT_TIMESTAMP WHERE `id` = ?",
      [newName, id],
      (err) => {
        if (err) reject(err);
        resolve();
      }
    );
  });
}

/**
 * Returns all clusters that have a visibility of 'public'.
 */
export async function getPublicClusters() {
  const db = await getDatabaseConnection();
  return new Promise<Cluster[]>((resolve, reject) => {
    db.query(
      "SELECT * FROM `clusters` WHERE `visibility` = 'public'",
      [],
      (err, result) => {
        if (err) reject(err);
        resolve(result);
      }
    );
  });
}

export async function setClusterVisibility(
  id: string,
  newVisibility: ClusterVisibility
) {
  const db = await getDatabaseConnection();
  return new Promise<void>((resolve, reject) => {
    db.query(
      "UPDATE `clusters` SET `visibility` = ?, `updated_on` = CURRENT_TIMESTAMP WHERE `id` = ?",
      [newVisibility, id],
      (err) => {
        if (err) reject(err);
        resolve();
      }
    );
  });
}

export async function deleteCluster(id: string) {
  const db = await getDatabaseConnection();
  return new Promise<void>((resolve, reject) => {
    db.query("DELETE FROM `clusters` WHERE `id` = ?", [id], (err) => {
      if (err) reject(err);
      resolve();
    });
  });
}
