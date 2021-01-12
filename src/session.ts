import * as session from "express-session";
import * as express from "express";

/**
 * The cached sessionMiddleware, to be shared across the server
 */
let sessionMiddleware: express.RequestHandler | null = null;

export function getSessionMiddleware(): express.RequestHandler {
  if (sessionMiddleware == null) {
    return (sessionMiddleware = session({
      secret: process.env.SESSION_SECRET,
    }));
  } else {
    return sessionMiddleware;
  }
}
