import { Pool } from "pg";

function getDatabaseUrl() {
  return process.env.DATABASE_URL ?? process.env.DIRECTOR_DATABASE_URL;
}

export const db = new Pool({ connectionString: getDatabaseUrl() });
db.connect()
  .then(() => {
    console.log("Connected to Postgres");
  })
  .catch((err) => {
    console.error("Error connecting to Postgres:", err);
  });
