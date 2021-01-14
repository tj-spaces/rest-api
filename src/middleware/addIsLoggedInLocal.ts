import { RequestHandler } from "express";

const addIsLoggedInLocal: RequestHandler = (req, res, next) => {
  res.locals.isLoggedIn = !!req.session.isLoggedIn;
  next();
};
