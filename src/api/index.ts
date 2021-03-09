/*
  Copyright (C) Michael Fatemi - All Rights Reserved.
  Unauthorized copying of this file via any medium is strictly prohibited.
  Proprietary and confidential.
  Written by Michael Fatemi <myfatemi04@gmail.com>, February 2021.
*/
import { ErrorRequestHandler, Router } from "express";
import * as clusters from "./clusters";
import { InvalidArgumentError } from "./errors";
import * as friends from "./friends";
import * as spaces from "./spaces";
import * as users from "./users";

export const router = Router();

router.use("/clusters", clusters.router);
router.use("/spaces", spaces.router);
router.use("/users", users.router);
router.use("/friends", friends.router);

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (err instanceof InvalidArgumentError) {
    res.status(400);
    res.json({
      status: "error",
      error: "invalid_arg",
    });
  } else {
    res.status(500);
    res.json({
      status: "error",
      error: "internal_server_error",
    });
  }
};

router.use(errorHandler);
