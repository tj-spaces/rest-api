import { Client, Pool } from "pg";

function getDatabaseUrl() {
  return process.env.DATABASE_URL ?? process.env.DIRECTOR_DATABASE_URL;
}

export const db = new Pool({ connectionString: getDatabaseUrl() });
db.connect();
