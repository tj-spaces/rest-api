/**
 * This is where the typings for our session go.
 */
export interface SessionData {
  accountID: string;
}

declare global {
  namespace Express {
    interface Request {
      session: SessionData;
    }
  }
}
