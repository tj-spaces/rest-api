/*
  Copyright (C) Michael Fatemi - All Rights Reserved.
  Unauthorized copying of this file via any medium is strictly prohibited.
  Proprietary and confidential.
  Written by Michael Fatemi <myfatemi04@gmail.com>, February 2021.
*/
import { Router } from "express";
import {
  createEvent,
  getEvent,
  getEventHostID,
  updateEvent,
} from "../database/tables/events";
import { UnauthorizedError } from "./errors";
import {
  assertEventVisibility,
  assertString,
  assertStringID,
} from "./validationUtil";

export const router = Router();

router.patch("/:id", async (req, res, next) => {
  const { id } = req.params;
  const { name, description } = req.query;

  if (name != null) assertString(name, 1, 256);
  if (description != null) assertString(description, 1, 4096);

  const { accountID } = req.session;
  getEventHostID(id).then((eventHostID) => {
    if (accountID !== eventHostID) {
      throw new UnauthorizedError();
    } else {
      // @ts-expect-error
      updateEvent(id, { name, description })
        .then(() => {
          res.json({ status: "success" });
        })
        .catch((err) => next(err));
    }
  });
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  assertStringID(id);

  const results = await getEvent({ id });

  if (results.rowCount == 0) {
    res.json({ status: "error", error: "event_not_found" });
  } else {
    res.json({ status: "success", data: results.rows[0] });
  }
});

router.post("/", async (req, res) => {
  const {
    name,
    host_cluster_id,
    start_time,
    end_time,
    visibility,
    description,
  } = req.params;

  const { accountID } = req.session;

  assertString(name, 1, 256);
  if (host_cluster_id != null) {
    assertStringID(host_cluster_id);
  }
  assertEventVisibility(visibility);
  if (description != null) {
    assertString(description, 0, 4096);
  }

  let id = await createEvent({
    name,
    host_user_id: accountID,
    host_cluster_id,
    start_time,
    end_time,
    visibility,
    description,
  });

  res.json({ status: "success", data: { event_id: id } });
});
