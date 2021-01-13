import { getDatabaseConnection } from "../database";

export function doesUserExistWithEmail(email: string): boolean {
  const db = getDatabaseConnection();
  db.query({
    sql: "SELECT * FROM `users` WHERE `email` = $1",
    values: [email],
  });

  return false;
}

/**
 * This function should only be called AFTER somebody has been logged in, because it assumes
 * that the information it's given is true and authorized.
 */
export function loginWasSuccessful(email: string) {}
