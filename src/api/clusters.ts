import { Router } from "express";
import {
  startSpaceSession,
  getActiveSpaceSessionsInCluster,
} from "../database/tables/space_sessions";
import {
  createCluster,
  deleteCluster,
  doesClusterExist,
  getClusterByID,
  getPublicClusters,
} from "../database/tables/clusters";
import {
  didUserJoinCluster,
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
  InvalidArgumentError,
  NoopError,
  ResourceNotFoundError,
  UnauthorizedError,
} from "./errors";

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

router.get("/:clusterID", async (req, res) => {
  const { clusterID } = req.params;

  assertStringID(clusterID);

  const cluster = await getClusterByID(clusterID);

  if (cluster == null) {
    throw new ResourceNotFoundError();
  } else {
    res.json({ status: "success", data: cluster });
  }
});

router.delete("/:clusterID", requireApiAuth, async (req, res) => {
  const { clusterID } = req.params;
  const { accountID } = req.session;

  assertStringID(clusterID);
  assertClusterExists(clusterID);
  assertUserJoinedCluster(clusterID, accountID);

  // If we are in the group, then the group must exist, and we can delete it

  await deleteCluster(clusterID);

  res.json({
    status: "success",
  });
});

router.post("/:clusterID/join", requireApiAuth, async (req, res) => {
  const { accountID } = req.session;
  const { clusterID } = req.params;

  assertStringID(clusterID);
  assertClusterExists(clusterID);

  const inCluster = await didUserJoinCluster(clusterID, accountID);

  if (inCluster) {
    throw new NoopError();
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

  assertString(topic, 1, 255);
  assertSpaceVisibility(visibility);
  assertStringID(clusterID);
  assertClusterExists(clusterID);
  assertUserJoinedCluster(clusterID, accountID);

  // If we are in the group, then the group must exist, and we can add spaces to it

  res.json({
    status: "success",
    data: {
      space_id: await startSpaceSession(accountID, topic, visibility),
    },
  });
});

/**
 * Gets a list of spaces in this cluster.
 * Requires params:
 *  - `cluster_id` The cluster to find spaces for
 */
router.get("/:clusterID/spaces", requireApiAuth, async (req, res) => {
  const { accountID } = req.session;
  const { clusterID } = req.params;

  assertStringID(clusterID);
  assertClusterExists(clusterID);
  assertUserJoinedCluster(clusterID, accountID);

  // If we are in the group, then the group must exist
  res.json({
    status: "success",
    data: await getActiveSpaceSessionsInCluster(clusterID),
  });
});
