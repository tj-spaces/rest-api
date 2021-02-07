import { Router } from "express";
import { getPublicClusters } from "../database/tables/clusters";

export const router = Router();

router.get("/", async (req, res) => {
  const clusters = await getPublicClusters();
  res.json({
    status: "success",
    data: clusters,
  });
});
