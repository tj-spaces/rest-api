import { Router } from "express";
import { getClustersWithUser } from "../../database/tables/cluster_members";
import { getUserFromID } from "../../database/tables/users";
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
