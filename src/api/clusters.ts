/*
  Copyright (C) Michael Fatemi - All Rights Reserved.
  Unauthorized copying of this file via any medium is strictly prohibited.
  Proprietary and confidential.
  Written by Michael Fatemi <myfatemi04@gmail.com>, February 2021.
*/
import { Router } from "express";
import { getSpacesInCluster } from "../database/tables/spaces";
import {
  createCluster,
  deleteCluster,
  getClusterByID,
  getPublicClusters,
} from "../database/tables/clusters";
import {
  didUserJoinCluster,
  getUsersInCluster,
  joinCluster,
} from "../database/tables/cluster_members";
import requireApiAuth from "../lib/requireApiAuth";
import {
  assertClusterExists,
  assertClusterVisibility,
  assertSpaceVisibility,
  assertString,
  assertStringID,
  assertUserJoinedCluster,
} from "./validationUtil";
import {
  InternalServerError,
  InvalidArgumentError,
  NoopError,
  ResourceNotFoundError,
  UnauthorizedError,
} from "./errors";
import { getPublicUserFromID } from "../database/tables/users";

/**
 * Main router for Clusters API.
 * Contains routes:
 *  - POST /: Create a cluster. Returns { cluster_id }
 *  - GET /:clusterID: Get metadata about a Cluster.
 *  - GET /:clusterID/spaces: Get a list of spaces in a Cluster.
 */
export const router = Router();

/**
 * Requires params:
 *  - `name`: string, max 256 chars
 *  - `visibility`: either 'public' or 'unlisted'
 * Requires authentication
 */
router.post("/", requireApiAuth, async (req, res) => {
  const { visibility, name } = req.body;
  const { accountID } = req.session;

  assertString(name, 1, 255);
  assertClusterVisibility(visibility);

  const clusterID = await createCluster(accountID, name, visibility);

  await joinCluster(clusterID, accountID);

  res.json({
    status: "success",
    data: { cluster_id: clusterID },
  });
});

/**
 * Gets discoverable clusters
 * TODO: Add paging
 */
router.get("/discoverable", async (req, res) => {
  const clusters = await getPublicClusters();

  res.json({
    status: "success",
    data: clusters,
    paging: {},
  });
});

router.get("/:clusterID", async (req, res, next) => {
  const { clusterID } = req.params;

  assertStringID(clusterID);

  const cluster = await getClusterByID(clusterID);

  if (cluster == null) {
    next(new ResourceNotFoundError());
  } else {
    res.json({ status: "success", data: cluster });
  }
});

router.delete("/:clusterID", requireApiAuth, (req, res, next) => {
  const { clusterID } = req.params;
  const { accountID } = req.session;

  assertStringID(clusterID);

  (async () => {
    await assertClusterExists(clusterID);
    await assertUserJoinedCluster(clusterID, accountID);

    // If we are in the group, then the group must exist, and we can delete it

    await deleteCluster(clusterID);

    res.json({ status: "success" });
  })().catch(next);
});

router.post("/:clusterID/join", requireApiAuth, (req, res, next) => {
  const { accountID } = req.session;
  const { clusterID } = req.params;

  assertStringID(clusterID);
  assertClusterExists(clusterID);

  (async () => {
    const inCluster = await didUserJoinCluster(clusterID, accountID);

    if (inCluster) {
      throw new NoopError();
    } else {
      await joinCluster(clusterID, accountID);
      res.json({ status: "success" });
    }
  })().catch((err) => next(err));
});

/**
 * Gets a list of spaces in this cluster.
 * Requires params:
 *  - `cluster_id` The cluster to find spaces for
 */
router.get("/:clusterID/spaces", requireApiAuth, (req, res, next) => {
  const { accountID } = req.session;
  const { clusterID } = req.params;

  assertStringID(clusterID);

  (async () => {
    await assertClusterExists(clusterID);
    await assertUserJoinedCluster(clusterID, accountID);

    // If we are in the group, then the group must exist
    const spaces = await getSpacesInCluster(clusterID);
    res.json({ status: "success", data: spaces });
  })().catch(next);
});

/**
 * Gets a list of members in this cluster.
 * TODO: add paging
 */
router.get("/:clusterID/members", requireApiAuth, (req, res, next) => {
  const { accountID } = req.session;
  const { clusterID } = req.params;

  assertStringID(clusterID);

  (async () => {
    await assertClusterExists(clusterID);
    await assertUserJoinedCluster(clusterID, accountID);

    let ids = await getUsersInCluster(clusterID);
    let users = await Promise.all(ids.map((id) => getPublicUserFromID(id)));

    res.json({ status: "success", data: users, paging: {} });
  })().catch(next);
});
