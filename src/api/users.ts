/*
  Copyright (C) Michael Fatemi - All Rights Reserved.
  Unauthorized copying of this file via any medium is strictly prohibited.
  Proprietary and confidential.
  Written by Michael Fatemi <myfatemi04@gmail.com>, February 2021.
*/
import { Router } from "express";
import { getClustersWithUser } from "../database/tables/cluster_members";
import { getPublicUserFromID, getUserFromID } from "../database/tables/users";
import { getFriendsAfter } from "../database/tables/user_relations";
import requireApiAuth from "../lib/requireApiAuth";
import { assertStringID } from "./validationUtil";

export const router = Router();

router.get("/@me", requireApiAuth, async (req, res) => {
  const { accountID } = req.session;
  const user = await getUserFromID(accountID);
  res.json({ status: "success", data: user });
});

router.get("/:userID", requireApiAuth, async (req, res) => {
  const { userID } = req.params;
  assertStringID(userID);
  res.json({ status: "success", data: await getPublicUserFromID(userID) });
});

router.get("/@me/clusters", requireApiAuth, async (req, res) => {
  const { accountID } = req.session;
  const clusters = await getClustersWithUser(accountID);
  res.json({ status: "success", data: clusters });
});

/**
 * Sends a list of your friends, limit 25 at a time
 * If there's more than 25, it sends an "after" cursor
 */
router.get("/@me/friends", requireApiAuth, async (req, res) => {
  const { accountID } = req.session;
  const { after = "0" } = req.query;

  assertStringID(after);

  let result = await getFriendsAfter({
    from_user: accountID,
    after_id: after,
    limit: 25,
  });
  let last = result.rows[result.rowCount - 1]?.id ?? null;
  res.json({ status: "success", data: result.rows, paging: { after: last } });
});
