import { NextFunction, Router, ErrorRequestHandler } from "express";
import * as clusters from "./clusters/index";
import * as groups from "./groups/index";

export const router = Router();

router.use("/clusters", clusters.router);
router.use("/groups", groups.router);

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  res.status(500);
  res.json({
    status: "error",
    error: "internal_server_error",
  });
};

router.use(errorHandler);
