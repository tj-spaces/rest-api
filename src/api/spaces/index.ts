import { Router } from "express";
import { didUserJoinCluster } from "../../database/tables/cluster_members";
import { getSpaceSessionByID } from "../../database/tables/space_sessions";
import requireApiAuth from "../../middleware/requireApiAuth";

/* ROUTES TO MAKE:

 - GET /api/spaces/:spaceID

 Note: You cannot directly create a space. It is either created automatically in a group,
 or it can be added to a Cluster with POST /api/clusters/:clusterID/create_space.

*/

export const router = Router();

router.get("/:spaceID", requireApiAuth, async (req, res) => {
  const { spaceID } = req.params;
  const space = await getSpaceSessionByID(spaceID);

  if (space == null) {
    res.status(404);
    res.json({ status: "error", error: "space_not_found" });
  } else if (space.cluster_id != null) {
    let { accountID } = req.session;
    if (didUserJoinCluster(space.cluster_id, accountID)) {
      res.json({ status: "success", space });
    } else {
      res.json({ status: "error", error: "not_in_cluster" });
    }
  } else {
    res.json({ status: "success", space });
  }
});
