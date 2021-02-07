import { Router } from "express";
import {
  startSpaceSession,
  getActiveSpaceSessionsInCluster,
} from "../database/tables/space_sessions
import {
  createCluster,
  deleteCluster,
  doesClusterExist,
  getClusterByID,
} from "../database/tables/clusters";
import {
  didUserJoinCluster,
  joinCluster,
} from "../database/tables/cluster_members";
import requireApiAuth from "../middleware/requireApiAuth";

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

  if (typeof name !== "string" || name.length === 0 || name.length > 255) {
    res.status(400);
    res.json({ status: "error", error: "invalid_cluster_name" });
    return;
  }

  if (
    visibility !== "discoverable" &&
    visibility !== "unlisted" &&
    visibility !== "secret"
  ) {
    res.status(400);
    res.json({ status: "error", error: "invalid_cluster_visibility" });
    return;
  }

  const clusterID = await createCluster(accountID, name, visibility);

  await joinCluster(clusterID, accountID);

  res.json({
    status: "success",
    data: {
      cluster_id: clusterID,
    },
  });
});

router.get("/:clusterID", async (req, res) => {
  const { clusterID } = req.params;

  const cluster = await getClusterByID(clusterID);

  if (cluster == null) {
    res.status(404);
    res.json({ status: "error", error: "cluster_not_found" });
  } else {
    res.json({ status: "success", data: cluster });
  }
});

router.delete("/:clusterID", requireApiAuth, async (req, res) => {
  const { clusterID } = req.params;
  const { accountID } = req.session;

  const clusterExists = await doesClusterExist(clusterID);
  if (!clusterExists) {
    res.status(404);
    res.json({ status: "error", error: "cluster_not_found" });
    return;
  }

  const inCluster = await didUserJoinCluster(clusterID, accountID);

  if (!inCluster) {
    res.status(401);
    res.json({ status: "error", error: "not_in_cluster" });
  } else {
    // If we are in the group, then the group must exist, and we can delete it

    await deleteCluster(clusterID);

    res.json({
      status: "success",
    });
  }
});

router.post("/:clusterID/join", requireApiAuth, async (req, res) => {
  const { accountID } = req.session;
  const { clusterID } = req.params;

  const clusterExists = await doesClusterExist(clusterID);
  if (!clusterExists) {
    res.status(404);
    res.json({ status: "error", error: "cluster_not_found" });
    return;
  }

  const inCluster = await didUserJoinCluster(clusterID, accountID);

  if (inCluster) {
    res.json({ status: "success", message: "already_in_cluster" });
  } else {
    await joinCluster(clusterID, accountID);
    res.json({ status: "success" });
  }
});

/**
 * Creates a space in this cluster.
 * Requires params:
 *  - `topic` The topic of the space
 *  - `visibility` The visibility of the space
 */
router.post("/:clusterID/spaces", requireApiAuth, async (req, res) => {
  const { accountID } = req.session;
  const { clusterID } = req.params;
  const { topic, visibility } = req.body;

  if (typeof topic !== "string" || topic.length == 0 || topic.length > 255) {
    res.status(400);
    res.json({ status: "error", error: "invalid_space_topic" });
    return;
  }

  if (
    visibility !== "unlisted" &&
    visibility !== "discoverable" &&
    visibility !== "secret"
  ) {
    res.status(400);
    res.json({ status: "error", error: "invalid_space_visibility" });
    return;
  }

  const clusterExists = await doesClusterExist(clusterID);
  if (!clusterExists) {
    res.status(404);
    res.json({ status: "error", error: "cluster_not_found" });
    return;
  }

  const inCluster = await didUserJoinCluster(clusterID, accountID);

  if (!inCluster) {
    res.status(401);
    res.json({ status: "error", error: "not_in_cluster" });
  } else {
    // If we are in the group, then the group must exist, and we can add spaces to it

    res.json({
      status: "success",
      data: {
        space_id: await startSpaceSession(accountID, topic, visibility),
      },
    });
  }
});

/**
 * Gets a list of spaces in this cluster.
 * Requires params:
 *  - `cluster_id` The cluster to find spaces for
 */
router.get("/:clusterID/spaces", requireApiAuth, async (req, res) => {
  const { accountID } = req.session;
  const { clusterID } = req.params;

  const clusterExists = await doesClusterExist(clusterID);
  if (!clusterExists) {
    res.status(404);
    res.json({ status: "error", error: "cluster_not_found" });
    return;
  }

  const inCluster = await didUserJoinCluster(clusterID, accountID);

  if (!inCluster) {
    res.status(401);
    res.json({ status: "error", error: "not_in_cluster" });
  } else {
    // If we are in the group, then the group must exist
    res.json({
      status: "success",
      data: await getActiveSpaceSessionsInCluster(clusterID),
    });
  }
});
