import * as session from "express-session";
import { RequestHandler } from "express";
import { nextId } from "./lib/snowflakeId";

export interface SessionData {
  isLoggedIn: boolean;
  accountId: number;
}

export interface Session {
  expiresAt: number;
  data: SessionData;
}

const MEMORY_STORED_SESSIONS = new Map<number, Session>();

export function getSessionDataById(sessionId: number): SessionData | null {
  if (MEMORY_STORED_SESSIONS.has(sessionId)) {
    const session = MEMORY_STORED_SESSIONS.get(sessionId);
    if (Date.now() < session.expiresAt) {
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
export function createSession(accountId: number): number {
  const id = nextId();

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
