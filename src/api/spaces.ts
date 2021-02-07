import { Router } from "express";
import { db } from "../database";
import { didUserJoinCluster } from "../database/tables/cluster_members";
import {
  getSpaceSessionByID,
  startSpaceSession,
} from "../database/tables/space_sessions";
import requireApiAuth from "../middleware/requireApiAuth";

/* ROUTES TO MAKE:

 - GET /api/spaces/:spaceID
 - POST /api/spaces
*/

export const router = Router();

/**
 * REQUIRED FIELDS
 * - space session topic
 * - space session visibility
 */
router.post("/", requireApiAuth, async (req, res) => {
  const { accountID } = req.session;
  const { topic, visibility } = req.body;
  if (typeof topic !== "string" || topic.length > 255 || topic.length === 0) {
    res.status(400);
    res.json({ status: "error", error: "invalid_topic" });
    return;
  }

  if (
    visibility !== "discoverable" &&
    visibility !== "unlisted" &&
    visibility !== "secret"
  ) {
    res.status(400);
    res.json({ status: "error", error: "invalid_visibility" });
    return;
  }

  let space_id = await startSpaceSession(accountID, topic, visibility);

  res.json({ status: "success", data: { space_id } });
});

/**
 * Gets suggested spaces
 */
router.get("/suggested", requireApiAuth, async (req, res) => {
  let result = await db.query(`SELECT * FROM space_sessions;`);
  res.json({ status: "success", data: result.rows });
});

/**
 * Gets a space with a specific ID
 */
router.get("/:spaceID", requireApiAuth, async (req, res) => {
  const { spaceID } = req.params;
  const space_session = await getSpaceSessionByID(spaceID, true);

  if (space_session == null) {
    res.status(404);
    res.json({ status: "error", error: "space_not_found" });
  } else if (
    space_session.cluster_id != null &&
    space_session.visibility !== "discoverable"
  ) {
    let { accountID } = req.session;
    if (didUserJoinCluster(space_session.cluster_id, accountID)) {
      res.json({ status: "success", data: space_session });
    } else {
      res.json({ status: "error", error: "not_in_cluster" });
    }
  } else {
    res.json({ status: "success", data: space_session });
  }
});
