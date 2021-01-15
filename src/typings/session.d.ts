/**
 * This is where the typings for our session go.
 */
export interface SessionData {
  isLoggedIn: boolean;
  accountId: number;
}

declare global {
  namespace Express {
    interface Request {
      session: SessionData;
    }
  }
}
