import * as session from "express-session";
import { RequestHandler } from "express";

/**
 * The cached sessionMiddleware, to be shared across the server
 */
let sessionMiddleware: RequestHandler | null = null;

export function getSessionMiddleware(): RequestHandler {
  if (sessionMiddleware == null) {
    return (sessionMiddleware = session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
    }));
  } else {
    return sessionMiddleware;
  }
}
