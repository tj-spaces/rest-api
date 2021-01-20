import { Router } from "express";
import { doesSpaceExist } from "../../database/tables/spaces";

/* ROUTES TO MAKE:

 - GET /api/spaces/:spaceId

 Note: You cannot directly create a space. It is either created automatically in a group,
 or it can be added to a Cluster with POST /api/clusters/:clusterId/create_space.

*/

export const router = Router();

router.get("/:spaceId", async (req, res) => {
  const { spaceId } = req.params;
  const spaceExists = await doesSpaceExist(spaceId);

  if (!spaceExists) {
  }
});
