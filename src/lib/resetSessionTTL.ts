import { redis } from "../redis";

/**
 * Resets the TTL of a session
 * @param sessionID The ID of the session to reset
 */
export default function resetSessionTTL(
  sessionID: string,
  ttl: number = 3600 * 24
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    redis.EXPIRE("session.user_id:" + sessionID, ttl, (err) => {
      err ? reject(err) : resolve();
    });
  });
}
