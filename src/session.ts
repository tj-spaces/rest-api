import * as session from "express-session";

// typeof RequestHandler
let sessionMiddleware: any;

export function getSessionMiddleware() {
  if (sessionMiddleware == null) {
    return (sessionMiddleware = session({
      secret: process.env.SESSION_SECRET,
    }));
  } else {
    return sessionMiddleware;
  }
}
