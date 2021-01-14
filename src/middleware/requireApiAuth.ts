import { RequestHandler } from "express";

const requireApiAuth: RequestHandler = (req, res, next) => {
  if (!req.session.isLoggedIn) {
    res.status(401);
    res.json({ error: "unauthorized" });
  } else {
    next();
  }
};

export default requireApiAuth;
