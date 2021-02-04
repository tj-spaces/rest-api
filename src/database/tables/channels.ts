import { db } from "..";

interface Channel {
  id: string;
  name: string;
  cluster_id: string | null;
  is_cluster_channel: boolean;
  subsection_name: string | null;
}

export function getChannelByID(id: string): Promise<Channel> {
  return new Promise<Channel>((resolve, reject) => {
    db.query(
      `SELECT cast("id" as VARCHAR), "name", "cluster_id", "is_cluster_channel", "subsection_name" FROM "channels" WHERE "id" = $1`,
      [id],
      (err, res) => {
        if (err) {
          reject(err);
        } else if (res.rowCount === 0) {
          resolve(null);
        } else {
          resolve(res.rows[0]);
        }
      }
    );
  });
}

export function createChannel(
  id: string,
  name: string,
  cluster_id: string
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    db.query(
      `INSERT INTO "channels" ("id", "name", "cluster_id", "is_cluster_channel") VALUES ($1, $2, $3, true)`,
      [id, name, cluster_id],
      (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      }
    );
  });
}

export function setChannelSubsection(
  id: string,
  subsection_name: string
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    db.query(
      `UPDATE "channels" SET "subsection_name" = $1 WHERE "id" = $2`,
      [subsection_name, id],
      (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      }
    );
  });
}
