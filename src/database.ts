import * as mysql from "mysql";

let connection: mysql.Connection = null;

function getDatabaseUrl() {
  return process.env.DATABASE_URL ?? process.env.DIRECTOR_DATABASE_URL;
}

export function getDatabaseConnection() {
  if (connection == null) {
    return (connection = mysql.createConnection(getDatabaseUrl()));
  } else {
    return connection;
  }
}
