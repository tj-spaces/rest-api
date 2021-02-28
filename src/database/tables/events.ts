import { db } from "..";
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

export async function createEvent(spec: Event) {
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
