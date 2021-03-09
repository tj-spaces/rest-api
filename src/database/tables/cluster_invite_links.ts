/*
  Copyright (C) Michael Fatemi - All Rights Reserved.
  Unauthorized copying of this file via any medium is strictly prohibited.
  Proprietary and confidential.
  Written by Michael Fatemi <myfatemi04@gmail.com>, February 2021.
*/
import { db } from "..";
import createBase36String from "../../lib/createBase36String";
import getFirst from "../../lib/getFirst";
import { nextID } from "../../lib/snowflakeID";
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
  let result = await db.query(
    `SELECT 1 FROM "cluster_invite_links" WHERE "slug" = $1`,
    [slug]
  );

  return result.rowCount > 0;
}

export interface CreateClusterInviteLinkResult {
  success: boolean;
  slug?: string;
}

export async function createClusterInviteLink(
  clusterID: string,
  slug?: string
): Promise<CreateClusterInviteLinkResult> {
  if (!(await doesClusterExist(clusterID))) {
    throw new Error("Cluster does not exist with id: " + clusterID);
  }

  const id = nextID();

  if (slug === undefined) {
    // Generate a unique slug
    slug = await generateClusterInviteLinkSlug();
  } else {
    // User-specified slug
    if (await doesClusterInviteLinkExistWithSlug(slug)) {
      return { success: false };
    }
  }

  await db.query(
    `INSERT INTO "cluster_invite_links" ("id", "slug", "cluster_id") VALUES ($1, $2, $3)`,
    [id, slug, clusterID]
  );

  return { success: true, slug };
}

/**
 *
 * @param slug The shortlink that this invite link provides
 */
export async function getInviteLinkWithSlug(slug: string) {
  let result = await db.query(
    `SELECT * FROM "cluster_invite_links" WHERE "slug" = $1 LIMIT 1`,
    [slug]
  );

  return getFirst(result.rows);
}

/**
 * Get a list of the members of a cluster.
 * Returns an array of strings, which are UserIDs.
 * @param userID The user
 */
export async function getInviteLinksWithClusterID(clusterID: string) {
  let result = await db.query<ClusterInviteLink>(
    `SELECT * FROM "cluster_invite_links" WHERE "cluster_id" = $1`,
    [clusterID]
  );

  return result.rows;
}

export async function deleteInviteLinkWithID(id: string) {
  await db.query(`DELETE FROM "cluster_invite_links" WHERE "id" = $1`, [id]);
}
