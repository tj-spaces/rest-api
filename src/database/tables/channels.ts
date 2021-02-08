import { db } from "..";
import getFirst from "../../lib/getFirst";
import { nextID } from "../../lib/snowflakeID";

interface Channel {
  id: string;
  name: string;
  cluster_id: string | null;
  is_cluster_channel: boolean;
  subsection_name: string | null;
}

export async function getChannelByID(id: string): Promise<Channel> {
  let result = await db.query<Channel>(
    `SELECT cast("id" as VARCHAR), "name", "cluster_id", "is_cluster_channel", "subsection_name" FROM "channels" WHERE "id" = $1 LIMIT 1`,
    [id]
  );

  return getFirst(result.rows);
}

export async function createChannel(
  name: string,
  clusterID: string
): Promise<string> {
  const id = nextID().toString();
  await db.query(
    `INSERT INTO "channels" ("id", "name", "cluster_id", "is_cluster_channel") VALUES ($1, $2, $3, true)`,
    [id, name, clusterID]
  );
  return id;
}

export async function setChannelSubsection(id: string, subsection: string) {
  await db.query(
    `UPDATE "channels" SET "subsection_name" = $1 WHERE "id" = $2`,
    [subsection, id]
  );
}
