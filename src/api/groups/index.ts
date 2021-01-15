import { Router } from "express";
import { getGroup } from "../../database/tables/groups";
import {
  getGroupMembers,
  isUserInGroup,
} from "../../database/tables/group_members";
import requireApiAuth from "../../middleware/requireApiAuth";

const router = Router();

router.get("/members", requireApiAuth, async (req, res) => {
  const { accountId } = req.session;

  if (typeof req.query.group_id !== "string") {
    res.status(400);
    res.json({ error: "invalid_group_id" });
    return;
  }

  const groupId = parseInt(req.query.group_id);
  const inGroup = await isUserInGroup(groupId, accountId);

  if (!inGroup) {
    res.status(401);
    res.json({ error: "not_in_group" });
  } else {
    // If we are in the group, then the group must exist
    res.json({ status: "success", members: await getGroupMembers(groupId) });
  }
});

router.get("/info", requireApiAuth, async (req, res) => {
  const { accountId } = req.session;

  if (typeof req.query.group_id !== "string") {
    res.status(400);
    res.json({ error: "invalid_group_id" });
    return;
  }

  const groupId = parseInt(req.query.group_id);
  const inGroup = await isUserInGroup(groupId, accountId);

  if (!inGroup) {
    res.status(401);
    res.json({ error: "not_in_group" });
  } else {
    // If we are in the group, then the group must exist
    res.json({ status: "success", group: await getGroup(groupId) });
  }
});
