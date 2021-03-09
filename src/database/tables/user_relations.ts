/*
  Copyright (C) Michael Fatemi - All Rights Reserved.
  Unauthorized copying of this file via any medium is strictly prohibited.
  Proprietary and confidential.
  Written by Michael Fatemi <myfatemi04@gmail.com>, February 2021.
*/
import { db } from "..";
import prepareStatement from "../../lib/prepareStatement";

export type UserRelationType =
  | "friends"
  | "blocked"
  | "requested_friends"
  | "following"
  | "requested_to_follow";

export interface UserRelation {
  from_user: string;
  to_user: string;
  relation_type: UserRelationType;
  created_at: string;
  updated_at: string;
}

export const createUserRelation = prepareStatement<
  void,
  { from_user: string; to_user: string; relation_type: UserRelationType }
>(
  `INSERT INTO user_relations (from_user, to_user, relation_type) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING;`,
  { from_user: 1, to_user: 2, relation_type: 3 }
);

export const createOrUpdateUserRelation = prepareStatement<
  void,
  { from_user: string; to_user: string; relation_type: UserRelationType }
>(
  `INSERT INTO user_relations (from_user, to_user, relation_type) VALUES ($1, $2, $3) ON CONFLICT (from_user, to_user) DO UPDATE SET relation_type = $3;`,
  { from_user: 1, to_user: 2, relation_type: 3 }
);

export const updateUserRelation = prepareStatement<
  void,
  { from_user: string; to_user: string; relation_type: UserRelationType }
>(
  `UPDATE user_relations SET relation_type = $3 WHERE from_user = $1 AND to_user = $2;`,
  { from_user: 1, to_user: 2, relation_type: 3 }
);

export const queryUserRelationType = prepareStatement<
  { relation_type: UserRelationType; created_at: string; updated_at: string },
  { from_user: string; to_user: string }
>(
  `SELECT relation_type, created_at, updated_at FROM user_relations WHERE from_user = $1 AND to_user = $2 LIMIT 1`,
  { from_user: 1, to_user: 2 }
);

export const getUserRelationType = async (args: {
  from_user: string;
  to_user: string;
}): Promise<UserRelationType | null> => {
  let result = await queryUserRelationType(args);
  if (result.rowCount === 0) {
    return null;
  } else {
    return result.rows[0].relation_type;
  }
};

export interface OutgoingRelationResult {
  to_user: string;
  created_at: string;
  updated_at: string;
}

export interface IncomingRelationResult {
  from_user: string;
  created_at: string;
  updated_at: string;
}

export interface PublicUserInfo {
  id: string;
  name: string;
  picture: string;
}

export const getFriendsAfter = prepareStatement<
  PublicUserInfo,
  { from_user: string; after_id: string; limit: number }
>(
  `SELECT
		users.id, users.name, users.picture
	FROM
		user_relations
	INNER JOIN
		users
		ON users.id = to_user
	WHERE
		from_user = $1 AND to_user > $2 AND relation_type = 'friends'
	LIMIT $3;`,
  { from_user: 1, after_id: 2, limit: 3 }
);

export const getFriendsBefore = prepareStatement<
  OutgoingRelationResult,
  { from_user: string; before_id: string; limit: number }
>(
  `SELECT
		user.id, user.name, user.picture
	FROM
		user_relations
	INNER JOIN
		users user
		ON users.id = to_user
	WHERE
		from_user = $1 AND to_user < $2 AND relation_type = 'friends'
	LIMIT $3;`,
  { from_user: 1, before_id: 2, limit: 3 }
);

export const getIncomingFriendRequests = prepareStatement<
  IncomingRelationResult,
  { to_user: string }
>(
  `SELECT from_user, created_at, updated_at FROM user_relations WHERE to_user = $1 AND relation_type = 'requested_friends';`,
  { to_user: 1 }
);

export const getOutgoingFriendRequests = prepareStatement<
  OutgoingRelationResult,
  { from_user: string }
>(
  `SELECT to_user, created_at, updated_at FROM user_relations WHERE from_user = $1 AND relation_type = 'requested_friends';`,
  { from_user: 1 }
);

export async function sendFriendRequest(fromUserID: string, toUserID: string) {
  await createUserRelation({
    from_user: fromUserID,
    to_user: toUserID,
    relation_type: "requested_friends",
  });
}

export const deleteFriendRequest = prepareStatement<
  void,
  { to_user: string; from_user: string }
>(
  `DELETE FROM user_relations WHERE to_user = $1 AND from_user = $2 AND relation_type = 'requested_friends';`,
  { to_user: 1, from_user: 2 }
);

export const block = prepareStatement<
  void,
  { to_user: string; from_user: string }
>(
  `UPDATE user_relations SET relation_type = 'blocked' WHERE to_user = $1 AND from_user = $2`,
  { to_user: 1, from_user: 2 }
);

export async function doesUserBlock(fromUserID: string, toUserID: string) {
  return (
    (await queryUserRelationType({ from_user: fromUserID, to_user: toUserID }))
      .rows[0].relation_type === "blocked"
  );
}

export async function makeFriendRelation({
  user_a,
  user_b,
}: {
  user_a: string;
  user_b: string;
}) {
  // Ensure that both connections are "friends"
  await createOrUpdateUserRelation({
    from_user: user_a,
    to_user: user_b,
    relation_type: "friends",
  });

  await createOrUpdateUserRelation({
    to_user: user_a,
    from_user: user_b,
    relation_type: "friends",
  });
}

export async function getSuggestedFriends(
  search: string,
  from_user: string
): Promise<OutgoingRelationResult[]> {
  let result = await db.query<OutgoingRelationResult>(
    `
SELECT
	users.id, users.name, users.picture
FROM
	users
LEFT JOIN
	user_relations
ON
	(user_relations.from_user = $2 OR user_relations.to_user = $2)
WHERE
	users.name ILIKE $1 AND (user_relations.from_user IS NULL OR user_relations.to_user IS NULL) AND users.id != $2;
`,
    ["%" + search + "%", from_user]
  );

  return result.rows;
}
