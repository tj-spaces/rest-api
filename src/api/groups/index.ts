import { Router } from "express";
import { getGroup } from "../../database/tables/groups";
import {
  getGroupMembers,
  isUserInGroup,
} from "../../database/tables/group_members";
import requireApiAuth from "../../middleware/requireApiAuth";

export const router = Router();

router.get("/:groupId", requireApiAuth, async (req, res) => {
  const { accountId } = req.session;
  const { groupId } = req.params;

  const inGroup = await isUserInGroup(groupId, accountId);

  if (!inGroup) {
    res.status(401);
    res.json({ status: "error", error: "not_in_group" });
  } else {
    // If we are in the group, then the group must exist
    res.json({ status: "success", group: await getGroup(groupId) });
  }
});

router.get("/:groupId/members", requireApiAuth, async (req, res) => {
  const { accountId } = req.session;
  const { groupId } = req.params;

  const inGroup = await isUserInGroup(groupId, accountId);

  if (!inGroup) {
    res.status(401);
    res.json({ status: "error", error: "not_in_group" });
  } else {
    // If we are in the group, then the group must exist
    res.json({ status: "success", members: await getGroupMembers(groupId) });
  }
});
