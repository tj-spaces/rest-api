import { getDatabaseConnection } from "..";
import createBase36String from "../../lib/createBase36String";
import createUuid from "../../lib/createUuid";
import { doesClusterExist } from "./clusters";

export interface ClusterInviteLink {
  id: string;
  slug: string;
  cluster_id: string;
}

/**
 * Generates a unique, random slug for a cluster invite link.
 * Guaranteed to be 8 characters long, case-insensitive, and use
 * the characters A-Z and 0-9.
 */
export async function generateClusterInviteLinkSlug() {
  let slug: string;
  do {
    slug = createBase36String(8);
  } while (!(await doesClusterInviteLinkExistWithSlug(slug)));
  return slug;
}

export async function doesClusterInviteLinkExistWithSlug(slug: string) {
  const db = await getDatabaseConnection();

  return new Promise<boolean>((resolve, reject) => {
    db.query(
      "SELECT 1 FROM `cluster_invite_links` WHERE `slug` = ?",
      [slug],
      (err, result) => {
        if (err) reject(err);
        resolve(result.length > 0);
      }
    );
  });
}

export interface CreateClusterInviteLinkResult {
  success: boolean;
  slug?: string;
}

export async function createClusterInviteLink(
  clusterId: string,
  slug?: string
): Promise<CreateClusterInviteLinkResult> {
  if (!(await doesClusterExist(clusterId))) {
    throw new Error("Cluster does not exist with id: " + clusterId);
  }

  const db = await getDatabaseConnection();
  const id = createUuid();

  if (slug === undefined) {
    // Generate a unique slug
    slug = await generateClusterInviteLinkSlug();
  } else {
    // User-specified slug
    if (await doesClusterInviteLinkExistWithSlug(slug)) {
      return { success: false };
    }
  }

  return new Promise<CreateClusterInviteLinkResult>((resolve, reject) => {
    db.query(
      "INSERT INTO `cluster_invite_links` (`id`, `slug`, `cluster_id`) VALUES (?, ?, ?)",
      [id, slug, clusterId],
      (err) => {
        if (err) reject(err);
        resolve({ success: true, slug });
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
