import { Router, ErrorRequestHandler } from "express";
import * as clusters from "./clusters";
import * as dclusters from "./discoverableClusters";
import * as spaces from "./spaces";
import * as users from "./users";
import * as friends from "./friends";

export const router = Router();

router.use("/clusters", clusters.router);
router.use("/discoverable-clusters", dclusters.router);
router.use("/spaces", spaces.router);
router.use("/users", users.router);
router.use("/friends", friends.router);

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  res.status(500);
  res.json({
    status: "error",
    error: "internal_server_error",
  });
};

router.use(errorHandler);
