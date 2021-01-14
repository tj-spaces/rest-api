import * as mysql from "mysql";

let connection: mysql.Connection = null;

function getDatabaseUrl() {
  return process.env.DATABASE_URL ?? process.env.DIRECTOR_DATABASE_URL;
}

export async function getDatabaseConnection() {
  if (connection == null) {
    connection = mysql.createConnection(getDatabaseUrl());

    await new Promise<void>((resolve, reject) => {
      connection.connect((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });

    return connection;
  } else {
    return connection;
  }
}
