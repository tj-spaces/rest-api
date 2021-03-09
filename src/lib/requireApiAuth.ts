/*
  Copyright (C) Michael Fatemi - All Rights Reserved.
  Unauthorized copying of this file via any medium is strictly prohibited.
  Proprietary and confidential.
  Written by Michael Fatemi <myfatemi04@gmail.com>, February 2021.
*/
import { RequestHandler } from "express";

const requireApiAuth: RequestHandler = (req, res, next) => {
  if (req.session?.accountID == null) {
    res.status(401);
    res.json({ error: "unauthorized" });
  } else {
    next();
  }
};

export default requireApiAuth;
