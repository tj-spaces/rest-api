import { RequestHandler } from "express";
import createUuid from "./lib/createUuid";
import { SessionData } from "./typings/session";

export interface Session {
  expiresAt: number;
  data: SessionData;
}

const MEMORY_STORED_SESSIONS = new Map<string, Session>();

export function getSessionDataById(sessionId: string): SessionData | null {
  if (MEMORY_STORED_SESSIONS.has(sessionId)) {
    const session = MEMORY_STORED_SESSIONS.get(sessionId);
    if (Date.now() > session.expiresAt) {
      MEMORY_STORED_SESSIONS.delete(sessionId);
      return null;
    } else {
      return MEMORY_STORED_SESSIONS.get(sessionId).data;
    }
  } else {
    return null;
  }
}

export const SESSION_LIFETIME_MS = 1000 * 60 * 60 * 24;

/**
 * Registers a session in the memory cache
 * @return Session id
 */
export function createSession(accountId: string): string {
  const id = createUuid();

  MEMORY_STORED_SESSIONS.set(id, {
    expiresAt: Date.now() + SESSION_LIFETIME_MS,
    data: {
      accountId,
      isLoggedIn: true,
    },
  });

  return id;
}

/**
 * The cached sessionMiddleware, to be shared across the server
 */
let sessionMiddleware: RequestHandler = (req, res, next) => {
  const auth = req.headers.authorization;
  // console.log("Checking request with Authorization = " + auth);
  if (typeof auth === "string" && auth.startsWith("Bearer ")) {
    const token = auth.slice(7);
    // console.log("Found token =", token);
    req.session = getSessionDataById(token);
    // console.log("Session data was", req.session);
    next();
  } else {
    next();
  }
};

export function getSessionMiddleware(): RequestHandler {
  return sessionMiddleware;
  // sessionMiddleware = session({
  //   secret: process.env.SESSION_SECRET,
  //   resave: false,
  //   saveUninitialized: false,
  // });
}
