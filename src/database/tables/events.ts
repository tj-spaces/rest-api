import { db } from "..";
import { ResourceNotFoundError } from "../../api/errors";
import createUpdateString from "../../lib/createUpdateString";
import prepareStatement from "../../lib/prepareStatement";
import { nextID } from "../../lib/snowflakeID";
import { doesClusterExist } from "./clusters";
import { doesUserExistWithID } from "./users";

export type EventVisibility = "unlisted" | "discoverable";

export interface Event {
  id: string;
  name: string;
  host_user_id: string;
  host_cluster_id?: string;
  start_time?: string;
  end_time?: string;
  visibility: EventVisibility;
  description?: string;
}

export async function createEvent(spec: Omit<Event, "id">) {
  if (!doesUserExistWithID(spec.host_user_id)) {
    throw new Error("Event host user does not exist");
  }

  if (spec.host_cluster_id != null) {
    if (!doesClusterExist(spec.host_cluster_id)) {
      throw new Error("Event host cluster does not exist");
    }
  }

  const id = nextID();

  await db.query(
    `
	INSERT INTO "events" (
		id, name, host_user_id, host_cluster_id, start_time, end_time, visibility, description
	) VALUES (
		$1, $2, $3, $4, $5, $6, $7, $8
	)`,
    [
      id,
      spec.name,
      spec.host_user_id,
      spec.host_cluster_id,
      spec.start_time,
      spec.end_time,
      spec.visibility,
      spec.description,
    ]
  );

  return id.toString();
}

export async function getEventHostID(eventID: string) {
  let result = await db.query<Event>(
    'SELECT "host_user_id" FROM "events" WHERE "id" = $1',
    [eventID]
  );

  return result.rowCount > 0 ? result.rows[0].host_user_id : null;
}

export async function updateEvent(
  eventID: string,
  updates: { name?: string; description?: string }
) {
  if (!(await doesEventExist(eventID))) {
    throw new ResourceNotFoundError();
  }

  const [str, values, nextIndex] = createUpdateString(updates);

  await db.query(
    `UPDATE "events" SET ${str} WHERE "id" = $${nextIndex}`,
    values.concat(eventID)
  );
}

export async function doesEventExist(eventID: string) {
  let res = await db.query('select 1 from "events" where "id" = $1 LIMIT 1', [
    eventID,
  ]);
  return res.rowCount > 0;
}

export const getEvent = prepareStatement<Event, { id: string }>(
  `SELECT * FROM "events" WHERE "id" = $1`,
  { id: 1 }
);

export const setEventDescription = prepareStatement<
  Event,
  { id: string; description: string }
>(`UPDATE "events" SET "description" = $2 WHERE "id" = $1`, {
  id: 1,
  description: 2,
});

export const deleteEvent = prepareStatement<Event, { id: string }>(
  `DELETE FROM "events" WHERE "id" = $1`,
  { id: 1 }
);
