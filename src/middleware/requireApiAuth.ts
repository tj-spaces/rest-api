import { RequestHandler } from "express";

const requireApiAuth: RequestHandler = (req, res, next) => {
  console.log(req.session);
  if (req.session == null || !req.session.isLoggedIn) {
    res.status(401);
    res.json({ error: "unauthorized" });
  } else {
    next();
  }
};

export default requireApiAuth;
