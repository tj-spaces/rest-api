/*
  Copyright (C) Michael Fatemi - All Rights Reserved.
  Unauthorized copying of this file via any medium is strictly prohibited.
  Proprietary and confidential.
  Written by Michael Fatemi <myfatemi04@gmail.com>, February 2021.
*/
import { ErrorRequestHandler, Router } from "express";

import * as clusters from "./clusters";
import * as friends from "./friends";
import * as spaces from "./spaces";
import * as users from "./users";

export const router = Router();

router.use("/clusters", clusters.router);
router.use("/spaces", spaces.router);
router.use("/users", users.router);
router.use("/friends", friends.router);

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (!(err instanceof Error)) {
    res.status(500);
    res.json({
      status: "error",
      error: "internal_server_error",
    });
    return;
  }

  if (err.name === "InvalidArgumentError") {
    res.status(400);
    res.json({
      status: "error",
      error: "invalid_arg",
    });
  } else if (err.name === "ResourceNotFoundError") {
    res.status(404);
    res.json({
      status: "error",
      error: "not_found",
    });
  } else if (err.name === "InvalidPermissionsError") {
    res.status(403);
    res.json({
      status: "error",
      error: "invalid_permissions",
    });
  } else if (err.name === "UnauthorizedError") {
    res.status(403);
    res.json({
      status: "error",
      error: "unauthorized",
    });
  } else if (err.name === "NoopError") {
    res.status(200);
    res.json({
      status: "success",
      noop: true,
    });
  } else if (err.name === "WrongRelationTypeError") {
    res.status(200);
    res.json({
      status: "error",
      error: "wrong_user_relation",
    });
  } else {
    res.status(500);
    res.json({
      status: "error",
      error: "internal_server_error",
    });
    console.error("Errored:", err.name);
  }
};

router.use(errorHandler);
