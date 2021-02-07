import { Router } from "express";
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
import requireApiAuth from "../middleware/requireApiAuth";

export const router = Router();

router.use(requireApiAuth);

/**
 * List incoming friend requests
 */
router.get("/incoming_requests", async (req, res) => {
  const { accountID } = req.session;
  let requests = await getIncomingFriendRequests({ to_user: accountID });

  res.json({ status: "success", data: requests.rows });
});

/**
 * List outgoing friend requests
 */
router.get("/outgoing_requests", async (req, res) => {
  const { accountID } = req.session;
  let requests = await getOutgoingFriendRequests({ from_user: accountID });

  res.json({ status: "success", data: requests.rows });
});

/**
 * Sends a friend request.
 * Params: user_id
 */
router.post("/send_request", async (req, res) => {
  const { accountID } = req.session;
  const { user_id } = req.body;

  if (typeof user_id !== "string") {
    res.status(400);
    res.json({ status: "error", error: "invalid_other_user_id" });
    return;
  }

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

  if (typeof user_id !== "string") {
    res.status(400);
    res.json({ status: "error", error: "invalid_other_user_id" });
    return;
  }

  let relationType = await getUserRelationType({
    from_user: user_id,
    to_user: accountID,
  });

  if (relationType === "requested_friends") {
    makeFriendRelation({ user_a: accountID, user_b: user_id });
    res.json({ status: "success" });
  } else {
    res.status(401);
    res.json({ status: "error", error: "request_not_found" });
  }
});

/**
 * Denies a friend request.
 * Params: user_id
 */
router.post("/deny_request", async (req, res) => {
  const { accountID } = req.session;
  const { user_id } = req.body;

  if (typeof user_id !== "string") {
    res.status(400);
    res.json({ status: "error", error: "invalid_other_user_id" });
    return;
  }

  let relationType = await getUserRelationType({
    from_user: user_id,
    to_user: accountID,
  });

  if (relationType === "requested_friends") {
    deleteFriendRequest({ to_user: accountID, from_user: user_id });
    res.json({ status: "success" });
  } else {
    res.json({ status: "error", error: "request_not_found" });
  }
});

router.post("/cancel_request", async (req, res) => {
  const { accountID } = req.session;
  const { user_id } = req.body;

  if (typeof user_id !== "string") {
    res.status(400);
    res.json({ status: "error", error: "invalid_other_user_id" });
    return;
  }

  let relationType = await getUserRelationType({
    from_user: accountID,
    to_user: user_id,
  });

  if (relationType === "requested_friends") {
    deleteFriendRequest({ from_user: accountID, to_user: user_id });
    res.json({ status: "success" });
  } else {
    res.json({ status: "error", error: "request_not_found" });
  }
});

/**
 * Blocks a user
 */
router.post("/block", async (req, res) => {
  const { accountID } = req.session;
  const { user_id } = req.body;

  if (typeof user_id !== "string") {
    res.status(400);
    res.json({ status: "error", error: "invalid_other_user_id" });
    return;
  }

  let relationType = await getUserRelationType({
    from_user: accountID,
    to_user: user_id,
  });

  if (relationType === "blocked") {
    res.status(400);
    res.json({ status: "error", error: "already_blocked" });
  } else {
    await updateUserRelation({
      from_user: accountID,
      to_user: user_id,
      relation_type: "blocked",
    });
    res.json({ status: "success" });
  }
});

/**
 * GET /suggested
 * Provides a list of suggested friends, given a search term for their name
 */
router.get("/suggested", async (req, res) => {
  const { accountID } = req.session;
  const { search = "" } = req.query;
  if (typeof search !== "string" || search.length > 255) {
    res.status(400);
    res.json({ status: "error", error: "invalid_search" });
    return;
  }

  let suggested = await getSuggestedFriends(search, accountID);

  console.log("Suggested friends search for", search, "returned", suggested);

  res.json({
    status: "success",
    data: suggested,
    paging: {},
  });
});
