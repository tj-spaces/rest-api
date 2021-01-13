import * as session from "express-session";
import { AccessToken } from "simple-oauth2";

// This line is necessary, or else the declaration below completely overwrites the "express-session" module
export = session;

declare module "express-session" {
  /**
   * This is where the typings for our session go.
   */
  interface SessionData {
    /**
     * Whether the user is authenticated
     */
    isLoggedIn: boolean;

    /**
     * The account ID of the user, if they are logged in
     */
    accountId?: string;

    /**
     * A temporary ID stored with each user in a given session
     */
    temporaryId: string;

    /**
     * Used to enforce IP bans
     */
    ipLoginList: string[];
  }
}
