import { RequestHandler } from "express";

const requireAuth: RequestHandler = (req, res, next) => {
  if (!req.session.isLoggedIn) {
    res.render("please_login");
  } else {
    next();
  }
};

export default requireAuth;
