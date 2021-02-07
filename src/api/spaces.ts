import { Router } from "express";
import { db } from "../database";
import {
  getSpaceSessionByID,
  SpaceSession,
  startSpaceSession,
} from "../database/tables/space_sessions";
import { getUserFromID } from "../database/tables/users";
import requireApiAuth from "../middleware/requireApiAuth";
import { ResourceNotFoundError } from "./errors";
import {
  assertSpaceVisibility,
  assertString,
  assertStringID,
  assertUserJoinedCluster,
} from "./validationUtil";

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

  assertString(topic, 1, 255);
  assertSpaceVisibility(visibility);

  let space_id = await startSpaceSession(accountID, topic, visibility);

  res.json({ status: "success", data: { space_id } });
});

/**
 * Gets suggested spaces
 */
router.get("/suggested", requireApiAuth, async (req, res) => {
  let result = await db.query<SpaceSession>(`SELECT * FROM space_sessions;`);
  let spaceSessions = result.rows;
  for (let spaceSession of spaceSessions) {
    spaceSession.host = await getUserFromID(spaceSession.host_id);
  }

  res.json({ status: "success", data: spaceSessions });
});

/**
 * Gets a space with a specific ID
 */
router.get("/:spaceID", requireApiAuth, async (req, res) => {
  const { spaceID } = req.params;

  assertStringID(spaceID);

  const space_session = await getSpaceSessionByID(spaceID, true);

  if (space_session == null) {
    throw new ResourceNotFoundError();
  }

  if (
    space_session.cluster_id != null &&
    space_session.visibility !== "discoverable"
  ) {
    let { accountID } = req.session;

    assertUserJoinedCluster(space_session.cluster_id, accountID);
  }

  res.json({ status: "success", data: space_session });
});
