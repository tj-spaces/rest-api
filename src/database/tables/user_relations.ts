import { db } from "..";
import prepareStatement from "../../lib/prepareStatement";
import { User } from "./users";

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

export const getUserRelationType = prepareStatement<
  { relation_type: UserRelationType; created_at: string; updated_at: string },
  { from_user: string; to_user: string }
>(
  `SELECT (relation_type, created_at, updated_at) FROM user_relations WHERE from_user = $1 AND to_user = $2`,
  { from_user: 1, to_user: 2 }
);

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

export interface Friend extends Partial<User> {
  id: string;
  name: string;
  picture: string;
}

export const getFriendsAfter = prepareStatement<
  Friend,
  { from_user: string; after_id: string; limit: number }
>(
  `SELECT
    (user.id, user.name, user.picture)
  FROM
    user_relations
  INNER JOIN
    users
    AS user
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
    (user.id, user.name, user.picture)
  FROM
    user_relations
  INNER JOIN
    users
    AS user
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
  `SELECT (from_user, created_at, updated_at) FROM user_relations WHERE to_user = $1 AND relation_type = 'requested_friends';`,
  { to_user: 1 }
);

export const getOutgoingFriendRequests = prepareStatement<
  OutgoingRelationResult,
  { from_user: string }
>(
  `SELECT (to_user, created_at, updated_at) FROM user_relations WHERE from_user = $1 AND relation_type = 'requested_friends';`,
  { from_user: 1 }
);

export async function sendFriendRequest(fromUserID: string, toUserID: string) {
  await createUserRelation({
    from_user: fromUserID,
    to_user: toUserID,
    relation_type: "requested_friends",
  });
}

export async function denyFriendRequest(from_user: string, to_user: string) {
  if (
    (await getUserRelationType({ from_user, to_user })).rows[0]
      .relation_type !== "requested_friends"
  ) {
    throw new Error("No request exists");
  }
}

export async function doesUserBlock(fromUserID: string, toUserID: string) {
  return (
    (await getUserRelationType({ from_user: fromUserID, to_user: toUserID }))
      .rows[0].relation_type === "blocked"
  );
}

export async function acceptFriendRequest(
  fromUserID: string,
  toUserID: string
) {
  await updateUserRelation({
    from_user: fromUserID,
    to_user: toUserID,
    relation_type: "friends",
  });

  await updateUserRelation({
    to_user: fromUserID,
    from_user: toUserID,
    relation_type: "friends",
  });
}
