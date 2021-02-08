import { Router } from "express";
import { getPublicUserFromID } from "../database/tables/users";
import {
  makeFriendRelation,
  getIncomingFriendRequests,
  getOutgoingFriendRequests,
  sendFriendRequest,
  deleteFriendRequest,
  getUserRelationType,
  updateUserRelation,
  getSuggestedFriends,
} from "../database/tables/user_relations";
import requireApiAuth from "../lib/requireApiAuth";
import {
  assertRelationIs,
  assertRelationIsNot,
  assertString,
  assertStringID,
} from "./validationUtil";

export const router = Router();

router.use(requireApiAuth);

/**
 * List incoming friend requests
 */
router.get("/incoming_requests", async (req, res) => {
  const { accountID } = req.session;
  let requests = await getIncomingFriendRequests({ to_user: accountID });
  let users = [];
  for (let row of requests.rows) {
    users.push(await getPublicUserFromID(row.from_user));
  }

  res.json({ status: "success", data: users });
});

/**
 * List outgoing friend requests
 */
router.get("/outgoing_requests", async (req, res) => {
  const { accountID } = req.session;
  let requests = await getOutgoingFriendRequests({ from_user: accountID });
  let users = [];
  for (let row of requests.rows) {
    users.push(await getPublicUserFromID(row.to_user));
  }

  res.json({ status: "success", data: users });
});

/**
 * Sends a friend request.
 * Params: user_id
 */
router.post("/send_request", async (req, res) => {
  const { accountID } = req.session;
  const { user_id } = req.body;

  assertStringID(user_id);

  let relationTypeFromOther = await getUserRelationType({
    from_user: user_id,
    to_user: accountID,
  });

  if (relationTypeFromOther === "blocked") {
    res.status(401);
    res.json({ status: "error", error: "blocked" });
  } else if (relationTypeFromOther === "friends") {
    res.status(401);
    res.json({ status: "error", error: "already_friends" });
  } else if (relationTypeFromOther === "requested_friends") {
    // They've already requested to become friends
    // For simplicity, we want "accepting request" and "sending request" at different endpoints
    res.status(401);
    res.json({ status: "error", error: "they_requested_friends" });
  } else {
    await sendFriendRequest(accountID, user_id);
    res.status(200);
    res.json({ status: "success" });
  }
});

/**
 * Accepts a friend request.
 * Params: user_id
 */
router.post("/accept_request", async (req, res) => {
  const { accountID } = req.session;
  const { user_id } = req.body;

  assertStringID(user_id);
  assertRelationIs(user_id, accountID, "requested_friends");

  await makeFriendRelation({ user_a: accountID, user_b: user_id });
  res.json({ status: "success" });
});

/**
 * Denies a friend request.
 * Params: user_id
 */
router.post("/deny_request", async (req, res) => {
  const { accountID } = req.session;
  const { user_id } = req.body;

  assertStringID(user_id);
  assertRelationIs(user_id, accountID, "requested_friends");

  await deleteFriendRequest({ to_user: accountID, from_user: user_id });
  res.json({ status: "success" });
});

router.post("/cancel_request", async (req, res) => {
  const { accountID } = req.session;
  const { user_id } = req.body;

  assertStringID(user_id);
  assertRelationIs(accountID, user_id, "requested_friends");

  deleteFriendRequest({ from_user: accountID, to_user: user_id });
  res.json({ status: "success" });
});

/**
 * Blocks a user
 */
router.post("/block", async (req, res) => {
  const { accountID } = req.session;
  const { user_id } = req.body;

  assertStringID(user_id);
  assertRelationIsNot(accountID, user_id, "blocked");

  await updateUserRelation({
    from_user: accountID,
    to_user: user_id,
    relation_type: "blocked",
  });

  res.json({ status: "success" });
});

/**
 * GET /suggested
 * Provides a list of suggested friends, given a search term for their name
 * TODO Add paging
 */
router.get("/suggested", async (req, res) => {
  const { accountID } = req.session;
  const { search = "" } = req.query;

  assertString(search, 0, 255);

  let suggested = await getSuggestedFriends(search, accountID);

  res.json({
    status: "success",
    data: suggested,
    paging: {},
  });
});
