import { getDatabaseConnection } from "..";
import createUuid from "../../lib/createUuid";
import { doesSpaceExist } from "./spaces";

export interface SpaceInviteLink {
  id: string;
  slug: string;
  space_id: string;
}

export async function createSpaceInviteLink(
  slug: string,
  spaceId: string,
  skipCheck: boolean = false
) {
  if (!skipCheck) {
    if (!(await doesSpaceExist(spaceId))) {
      throw new Error("Space does not exist with id: " + spaceId);
    }
  }

  const db = await getDatabaseConnection();
  const id = createUuid();

  return new Promise<void>((resolve, reject) => {
    db.query(
      "INSERT INTO `space_invite_links` (`id`, `slug`, `space_id`) VALUES (?, ?, ?)",
      [id, slug, spaceId],
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
  return new Promise<SpaceInviteLink | null>((resolve, reject) => {
    db.query(
      "SELECT * FROM `space_invite_links` WHERE `slug` = ?",
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
 * Get a list of the members of a space.
 * Returns an array of strings, which are UserIDs.
 * @param userId The user
 */
export async function getInviteLinksWithSpaceId(spaceId: string) {
  const db = await getDatabaseConnection();
  return new Promise<SpaceInviteLink>((resolve, reject) => {
    db.query(
      "SELECT * FROM `space_invite_links` WHERE `space_id` = ?",
      [spaceId],
      (err, results) => {
        if (err) reject(err);

        resolve(results);
      }
    );
  });
}

export async function deleteInviteLinkWithId(id: string) {
  const db = await getDatabaseConnection();
  return new Promise<void>((resolve, reject) => {
    db.query(
      "DELETE FROM `space_invite_links` WHERE `id` = ?",
      [id],
      (err, result) => {
        if (err) reject(err);
        resolve(result);
      }
    );
  });
}
