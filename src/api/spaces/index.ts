import { Router } from "express";
import { didUserJoinCluster } from "../../database/tables/cluster_members";
import { getSpaceSessionById } from "../../database/tables/space_sessions";
import requireApiAuth from "../../middleware/requireApiAuth";

/* ROUTES TO MAKE:

 - GET /api/spaces/:spaceId

 Note: You cannot directly create a space. It is either created automatically in a group,
 or it can be added to a Cluster with POST /api/clusters/:clusterId/create_space.

*/

export const router = Router();

router.get("/:spaceId", requireApiAuth, async (req, res) => {
  const { spaceId } = req.params;
  const space = await getSpaceSessionById(spaceId);

  if (space == null) {
    res.status(404);
    res.json({ status: "error", error: "space_not_found" });
  } else if (space.cluster_id != null) {
    let { accountId } = req.session;
    if (didUserJoinCluster(space.cluster_id, accountId)) {
      res.json({ status: "success", space });
    } else {
      res.json({ status: "error", error: "not_in_cluster" });
    }
  } else {
    res.json({ status: "success", space });
  }
});
