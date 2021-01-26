import { getDatabaseConnection } from "..";
import createUuid from "../../lib/createUuid";
import { getConnectionCount } from "../../spaces/server";
import { doesClusterExist } from "./clusters";

/**
 * This just stores the id of the cluster, the name, and the theme color.
 * Maybe we'll add the ability to lock clusters in the future.
 * For now, all clusters have their own group chat and voice chat built in
 */
export interface BaseSpace {
  id: string;
  name: string;
  color: string;
}

export interface InstantSpace extends BaseSpace {
  type: "instant";
}

export interface GroupSpace extends BaseSpace {
  type: "group";
  group_id: string;
}

export interface ClusterSpace extends BaseSpace {
  type: "cluster";
  cluster_id: string;
}

export type Space = InstantSpace | GroupSpace | ClusterSpace;

export async function createSpaceInCluster(
  clusterId: string,
  name: string,
  color: string
): Promise<string> {
  const db = await getDatabaseConnection();

  const clusterExists = await doesClusterExist(clusterId);
  if (!clusterExists) {
    throw new Error("Cluster does not exist: " + clusterId);
  }

  const id = createUuid();
  return new Promise<string>((resolve, reject) => {
    db.query(
      "INSERT INTO `spaces` (`id`, `name`, `color`, `type`, `cluster_id`) VALUES (?, ?, ?, ?, ?)",
      [id, name, color, "cluster", clusterId],
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
  const db = await getDatabaseConnection();
  return new Promise<string>((resolve, reject) => {
    db.query(
      "SELECT `cluster_id` FROM `spaces` WHERE `type` = 'cluster' AND `id` = ?",
      [id],
      (err, results: BaseSpace[]) => {
        if (err) reject(err);
        else {
          if (results.length === 0) {
            resolve(null);
          } else {
            // @ts-ignore
            resolve(results[0].cluster_id);
          }
        }
      }
    );
  });
}

export async function getSpacesInCluster(clusterId: string): Promise<Space[]> {
  const db = await getDatabaseConnection();

  return await new Promise<Space[]>((resolve, reject) => {
    db.query(
      "SELECT * FROM `spaces` WHERE `type` = 'cluster' AND `cluster_id` = ?",
      [clusterId],
      (err, results) => {
        if (err) reject(err);

        resolve(
          results.map((space: BaseSpace) => ({
            ...space,
            online_count: getConnectionCount(space.id),
          }))
        );
      }
    );
  });
}

export async function doesSpaceExist(id: string) {
  const db = await getDatabaseConnection();
  return new Promise<boolean>((resolve, reject) => {
    db.query("SELECT 1 FROM `spaces` WHERE `id` = ?", [id], (err, results) => {
      if (err) reject(err);
      else resolve(results.length > 0);
    });
  });
}

export async function getSpaceById(id: string): Promise<Space | null> {
  const db = await getDatabaseConnection();
  return new Promise<Space | null>((resolve, reject) => {
    db.query("SELECT * FROM `spaces` WHERE `id` = ?", [id], (err, results) => {
      if (err) {
        reject(err);
      }

      if (results.length === 0) {
        resolve(null);
      } else {
        resolve({
          ...results[0],
        });
      }
    });
  });
}

export async function setSpaceName(id: string, newName: string) {
  const db = await getDatabaseConnection();
  return new Promise<void>((resolve, reject) => {
    db.query(
      "UPDATE `spaces` SET `name` = ? WHERE `id` = ?",
      [newName, id],
      (err) => {
        if (err) reject(err);
        resolve();
      }
    );
  });
}

export async function setSpaceColor(id: string, newColor: string) {
  const db = await getDatabaseConnection();
  return new Promise<void>((resolve, reject) => {
    db.query(
      "UPDATE `spaces` SET `color` = ? WHERE `id` = ?",
      [newColor, id],
      (err) => {
        if (err) reject(err);
        resolve();
      }
    );
  });
}

export async function deleteSpace(id: string) {
  const db = await getDatabaseConnection();
  return new Promise<void>((resolve, reject) => {
    db.query("DELETE FROM `spaces` WHERE `id` = ?", [id], (err) => {
      if (err) reject(err);
      resolve();
    });
  });
}
