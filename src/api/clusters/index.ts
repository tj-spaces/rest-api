import { Router } from "express";
import {
  createSpaceInCluster,
  getSpacesInCluster,
} from "../../database/tables/spaces";
import {
  createCluster,
  deleteCluster,
  doesClusterExist,
  getClusterById,
} from "../../database/tables/clusters";
import {
  didUserJoinCluster,
  joinCluster,
} from "../../database/tables/cluster_members";
import requireApiAuth from "../../middleware/requireApiAuth";

/**
 * Main router for Clusters API.
 * Contains routes:
 *  - POST /: Create a cluster. Returns { cluster_id }
 *  - GET /:clusterId: Get metadata about a Cluster.
 *  - GET /:clusterId/spaces: Get a list of spaces in a Cluster.
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
  const { accountId } = req.session;

  if (typeof name !== "string" || name.length === 0 || name.length > 255) {
    res.status(400);
    res.json({ status: "error", error: "invalid_cluster_name" });
    return;
  }

  if (visibility !== "public" && visibility !== "unlisted") {
    res.status(400);
    res.json({ status: "error", error: "invalid_cluster_visibility" });
    return;
  }

  const clusterId = await createCluster(accountId, name, visibility);

  await joinCluster(clusterId, accountId);

  res.json({
    status: "success",
    cluster_id: clusterId,
  });
});

router.get("/:clusterId", async (req, res) => {
  const { clusterId } = req.params;

  const cluster = await getClusterById(clusterId);

  if (cluster == null) {
    res.status(404);
    res.json({ status: "error", error: "cluster_not_found" });
  } else {
    res.json({ status: "success", cluster });
  }
});

router.delete("/:clusterId", requireApiAuth, async (req, res) => {
  const { clusterId } = req.params;
  const { accountId } = req.session;

  const clusterExists = await doesClusterExist(clusterId);
  if (!clusterExists) {
    res.status(404);
    res.json({ status: "error", error: "cluster_not_found" });
    return;
  }

  const inCluster = await didUserJoinCluster(clusterId, accountId);

  if (!inCluster) {
    res.status(401);
    res.json({ status: "error", error: "not_in_cluster" });
  } else {
    // If we are in the group, then the group must exist, and we can delete it

    await deleteCluster(clusterId);

    res.json({
      status: "success",
    });
  }
});

router.post("/:clusterId/join", requireApiAuth, async (req, res) => {
  const { accountId } = req.session;
  const { clusterId } = req.params;

  const clusterExists = await doesClusterExist(clusterId);
  if (!clusterExists) {
    res.status(404);
    res.json({ status: "error", error: "cluster_not_found" });
    return;
  }

  const inCluster = await didUserJoinCluster(clusterId, accountId);

  if (inCluster) {
    res.json({ status: "success", message: "already_in_cluster" });
  } else {
    await joinCluster(clusterId, accountId);
    res.json({ status: "success" });
  }
});

/**
 * Creates a space in this cluster.
 * Requires params:
 *  - `name` The name of the space
 */
router.post("/:clusterId/spaces", requireApiAuth, async (req, res) => {
  const { accountId } = req.session;
  const { clusterId } = req.params;
  const { name } = req.body;

  if (typeof name !== "string" || name.length == 0 || name.length > 255) {
    res.status(400);
    res.json({ status: "error", error: "invalid_space_name" });
    return;
  }

  const clusterExists = await doesClusterExist(clusterId);
  if (!clusterExists) {
    res.status(404);
    res.json({ status: "error", error: "cluster_not_found" });
    return;
  }

  const inCluster = await didUserJoinCluster(clusterId, accountId);

  if (!inCluster) {
    res.status(401);
    res.json({ status: "error", error: "not_in_cluster" });
  } else {
    // If we are in the group, then the group must exist, and we can add spaces to it

    res.json({
      status: "success",
      space_id: await createSpaceInCluster(clusterId, name, "blue"),
    });
  }
});

/**
 * Gets a list of spaces in this cluster.
 * Requires params:
 *  - `cluster_id` The cluster to find spaces for
 */
router.get("/:clusterId/spaces", requireApiAuth, async (req, res) => {
  const { accountId } = req.session;
  const { clusterId } = req.params;

  const clusterExists = await doesClusterExist(clusterId);
  if (!clusterExists) {
    res.status(404);
    res.json({ status: "error", error: "cluster_not_found" });
    return;
  }

  const inCluster = await didUserJoinCluster(clusterId, accountId);

  if (!inCluster) {
    res.status(401);
    res.json({ status: "error", error: "not_in_cluster" });
  } else {
    // If we are in the group, then the group must exist
    res.json({
      status: "success",
      spaces: await getSpacesInCluster(clusterId),
    });
  }
});
