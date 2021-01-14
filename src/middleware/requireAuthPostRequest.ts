import { RequestHandler } from "express";

const requireAuthPostRequest: RequestHandler = (req, res, next) => {
  if (!req.session.isLoggedIn) {
    res.status(401);
  } else {
    next();
  }
};

export default requireAuthPostRequest;
