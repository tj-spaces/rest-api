import { RequestHandler } from "express";
import createBase36String from "./lib/createBase36String";
import getSessionID from "./lib/getSessionID";
import resetSessionTTL from "./lib/resetSessionTTL";
import { redis } from "./redis";
import { SessionData } from "./typings/session";

export interface Session {
  expiresAt: number;
  data: SessionData;
}

export async function getSessionDataByID(
  sessionID: string
): Promise<SessionData> {
  return new Promise<SessionData>((resolve, reject) => {
    redis.GET("session.user_id:" + sessionID, (err, reply) => {
      if (err) {
        reject(err);
      } else {
        resolve({ accountID: reply ?? null });
      }
    });
  });
}

export const SESSION_LIFETIME_MS = 1000 * 60 * 60 * 24;

/**
 * Registers a session in the memory cache
 * @return Session id
 */
export async function createSession(accountID: string): Promise<string> {
  const sessionID = createBase36String(64);
  const setKey = new Promise<void>((resolve, reject) =>
    redis.SET("session.user_id:" + sessionID, accountID, (err) =>
      err ? reject(err) : resolve()
    )
  );
  const setKeyExpiration = new Promise<void>((resolve, reject) =>
    redis.EXPIRE("session.user_id:" + sessionID, 3600, (err) =>
      err ? reject(err) : resolve()
    )
  );

  await Promise.all([setKey, setKeyExpiration]);

  return sessionID;
}

/**
 * The cached sessionMiddleware, to be shared across the server
 */
export const sessionMiddleware: RequestHandler = async (req, res, next) => {
  const token = getSessionID(req);

  if (token != null) {
    req.session = await getSessionDataByID(token);
    await resetSessionTTL(token);
  } else {
    req.session = { accountID: null };
  }

  next();
};
