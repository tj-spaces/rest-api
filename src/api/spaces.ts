/*
  Copyright (C) Michael Fatemi - All Rights Reserved.
  Unauthorized copying of this file via any medium is strictly prohibited.
  Proprietary and confidential.
  Written by Michael Fatemi <myfatemi04@gmail.com>, February 2021.
*/
import { Router } from "express";
import { getSimulationServerURL, getVoiceServerURL } from "../aws";
import { db } from "../database";
import { didUserJoinCluster } from "../database/tables/cluster_members";
import {
  createSpace,
  doesSpaceExist,
  getClusterThatHasSpaceWithID,
  getSpaceByID,
  Space,
} from "../database/tables/spaces";
import createBase36String from "../lib/createBase36String";
import requireApiAuth from "../lib/requireApiAuth";
import { redis } from "../redis";
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
  const {
    name,
    description = "",
    visibility,
    allows_templating = false,
    world_type,
    cluster_id,
  } = req.body;

  assertString(name, 1, 32);
  assertString(description, 0, 255);
  assertSpaceVisibility(visibility);

  const isClusterSpace = cluster_id != null;

  // cluster_id is not required
  if (isClusterSpace) {
    assertStringID(cluster_id);
  }

  let space_id = await createSpace(
    isClusterSpace ? cluster_id : accountID,
    name,
    description,
    visibility,
    allows_templating,
    world_type,
    isClusterSpace ? "cluster" : "creator"
  );

  res.json({ status: "success", data: { space_id } });
});

/**
 * Gets suggested spaces
 */
router.get("/suggested", requireApiAuth, async (req, res) => {
  let result = await db.query<Space>(`SELECT * FROM spaces;`);

  res.json({ status: "success", data: result.rows });
});

/**
 * Creates a join code that can be used to connect to the gameserver.
 */
router.get("/:spaceID/join", requireApiAuth, async (req, res) => {
  const { accountID } = req.session;
  const { spaceID } = req.params;

  // Ensure that this space exists
  const exists = await doesSpaceExist(spaceID);
  if (!exists) {
    res.json({ status: "error", error: "space_not_found" });
    return;
  }

  // If this space is private, require that the user is allowed to join
  const cluster = await getClusterThatHasSpaceWithID(spaceID);
  if (cluster != null) {
    if (!(await didUserJoinCluster(cluster.id, accountID))) {
      res.json({ status: "error", error: "not_in_cluster" });
      return;
    }
  }

  const code = createBase36String(32);

  const setUser = new Promise<void>((resolve, reject) =>
    redis.SET("join_code.user_id:" + code, accountID, (err) => {
      err ? reject(err) : resolve();
    })
  );

  const setSpace = new Promise<void>((resolve, reject) =>
    redis.SET("join_code.space_id:" + code, spaceID, (err) => {
      err ? reject(err) : resolve();
    })
  );

  const setUserTTL = new Promise<void>((resolve, reject) =>
    redis.EXPIRE("join_code.user_id:" + code, 3600, (err) => {
      err ? reject(err) : resolve();
    })
  );

  const setSpaceTTL = new Promise<void>((resolve, reject) =>
    redis.EXPIRE("join_code.space_id:" + code, 3600, (err) => {
      err ? reject(err) : resolve();
    })
  );

  await Promise.all([setUser, setSpace, setUserTTL, setSpaceTTL]);

  const [voiceURL, simulationURL] = await Promise.all([
    getVoiceServerURL(),
    getSimulationServerURL(),
  ]);

  res.json({
    status: "success",
    data: { code, voiceURL, simulationURL },
  });
});

/**
 * Gets a space with a specific ID
 */
router.get("/:spaceID", requireApiAuth, async (req, res) => {
  const { spaceID } = req.params;

  assertStringID(spaceID);

  const space = await getSpaceByID(spaceID);

  if (space == null) {
    throw new ResourceNotFoundError();
  }

  if (space.cluster_id != null && space.visibility !== "discoverable") {
    let { accountID } = req.session;

    assertUserJoinedCluster(space.cluster_id, accountID);
  }

  res.json({ status: "success", data: space });
});
