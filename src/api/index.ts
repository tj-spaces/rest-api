import { Router, ErrorRequestHandler } from "express";
import * as clusters from "./clusters/index";
import * as dclusters from "./discoverable-clusters/index";
import * as spaces from "./spaces/index";
import * as users from "./users/index";

export const router = Router();

router.use("/clusters", clusters.router);
router.use("/discoverable-clusters", dclusters.router);
router.use("/spaces", spaces.router);
router.use("/users", users.router);

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  res.status(500);
  res.json({
    status: "error",
    error: "internal_server_error",
  });
};

router.use(errorHandler);
