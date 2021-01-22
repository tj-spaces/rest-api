import { Router } from "express";
import { getClustersWithUser } from "../../database/tables/cluster_members";
import { getUserFromId } from "../../database/tables/users";
import requireApiAuth from "../../middleware/requireApiAuth";

export const router = Router();

router.get("/@me", requireApiAuth, async (req, res) => {
  const { accountId } = req.session;
  const user = await getUserFromId(accountId);
  res.json({ status: "success", user });
});

router.get("/@me/clusters", requireApiAuth, async (req, res) => {
  const { accountId } = req.session;
  const clusters = await getClustersWithUser(accountId);
  res.json({ status: "success", clusters });
});
