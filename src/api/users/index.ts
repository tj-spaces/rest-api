import { Router } from "express";
import { getClustersWithUser } from "../../database/tables/cluster_members";
import { getUserFromID } from "../../database/tables/users";
import { getFriendsAfter } from "../../database/tables/user_relations";
import requireApiAuth from "../../middleware/requireApiAuth";

export const router = Router();

router.get("/@me", requireApiAuth, async (req, res) => {
  const { accountID } = req.session;
  const user = await getUserFromID(accountID);
  res.json({ status: "success", user });
});

router.get("/@me/clusters", requireApiAuth, async (req, res) => {
  const { accountID } = req.session;
  const clusters = await getClustersWithUser(accountID);
  res.json({ status: "success", clusters });
});

router.get("/@me/friends", requireApiAuth, async (req, res) => {
  const { accountID } = req.session;
  const { after_id = "0" } = req.query;
  if (typeof after_id !== "string") {
    res.status(400);
    res.json({ status: "error", error: "invalid after_id" });
    return;
  }
  let result = await getFriendsAfter({
    from_user: accountID,
    after_id: after_id,
    limit: 25,
  });
  let last = result.rows[result.rowCount - 1]?.id ?? null;
  res.json({ status: "success", data: result.rows, after: last });
});
