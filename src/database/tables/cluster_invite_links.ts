import { getDatabaseConnection } from "..";
import createUuid from "../../lib/createUuid";
import { doesClusterExist } from "./clusters";

export interface ClusterInviteLink {
  id: string;
  slug: string;
  cluster_id: string;
}

export async function createClusterInviteLink(
  slug: string,
  clusterId: string,
  skipCheck: boolean = false
) {
  if (!skipCheck) {
    if (!(await doesClusterExist(clusterId))) {
      throw new Error("Cluster does not exist with id: " + clusterId);
    }
  }

  const db = await getDatabaseConnection();
  const id = createUuid();

  return new Promise<void>((resolve, reject) => {
    db.query(
      "INSERT INTO `cluster_invite_links` (`id`, `slug`, `cluster_id`) VALUES (?, ?, ?)",
      [id, slug, clusterId],
      (err) => {
        if (err) reject(err);
        resolve();
      }
    );
  });
}

/**
 *
 * @param slug The shortlink that this invite link provides
 */
export async function getInviteLinkWithSlug(slug: string) {
  const db = await getDatabaseConnection();
  return new Promise<ClusterInviteLink | null>((resolve, reject) => {
    db.query(
      "SELECT * FROM `cluster_invite_links` WHERE `slug` = ?",
      [slug],
      (err, results) => {
        if (err) reject(err);
        if (results.length === 0) resolve(null);
        else resolve(results[0]);
      }
    );
  });
}

/**
 * Get a list of the members of a cluster.
 * Returns an array of strings, which are UserIDs.
 * @param userId The user
 */
export async function getInviteLinksWithClusterId(clusterId: string) {
  const db = await getDatabaseConnection();
  return new Promise<ClusterInviteLink[]>((resolve, reject) => {
    db.query(
      "SELECT * FROM `cluster_invite_links` WHERE `cluster_id` = ?",
      [clusterId],
      (err, results) => {
        if (err) reject(err);
        else resolve(results);
      }
    );
  });
}

export async function deleteInviteLinkWithId(id: string) {
  const db = await getDatabaseConnection();
  return new Promise<void>((resolve, reject) => {
    db.query(
      "DELETE FROM `cluster_invite_links` WHERE `id` = ?",
      [id],
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }
    );
  });
}
