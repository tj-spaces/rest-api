import * as session from "express-session";

export = session;

declare module "express-session" {
  interface SessionData {
    isLoggedIn: boolean;
    authenticationProvider: string;
    temporaryId: string;
    ipLoginList: string[];
  }
}
