import { Router } from "express";
import {
  makeFriendRelation,
  getIncomingFriendRequests,
  getOutgoingFriendRequests,
  getUserRelationType,
  sendFriendRequest,
  deleteFriendRequest,
} from "../../database/tables/user_relations";
import requireApiAuth from "../../middleware/requireApiAuth";

export const router = Router();

router.use(requireApiAuth);

router.get("/incoming_requests", async (req, res) => {
  const { accountID } = req.session;
  let requests = await getIncomingFriendRequests({ to_user: accountID });

  res.json({ status: "success", data: requests });
});

router.get("/outgoing_requests", async (req, res) => {
  const { accountID } = req.session;
  let requests = await getOutgoingFriendRequests({ from_user: accountID });

  res.json({ status: "success", data: requests });
});

/**
 * Sends a friend request.
 * Params: otherUserID
 */
router.post("/send_request", async (req, res) => {
  const { accountID } = req.session;
  const { otherUserID } = req.body;

  if (typeof otherUserID !== "string") {
    res.status(400);
    res.json({ status: "error", error: "invalid_other_user_id" });
    return;
  }

  let relationResult = await getUserRelationType({
    from_user: otherUserID,
    to_user: accountID,
  });

  if (relationResult.rowCount > 0) {
    let relationFromOtherUser = relationResult.rows[0].relation_type;
    if (relationFromOtherUser === "blocked") {
      res.status(401);
      res.json({ status: "error", error: "blocked" });
    } else if (relationFromOtherUser === "friends") {
      res.status(401);
      res.json({ status: "error", error: "already_friends" });
    } else if (relationFromOtherUser === "requested_friends") {
      // They've already requested to become friends
      // For simplicity, we want "accepting request" and "sending request" at different endpoints
      res.status(401);
      res.json({ status: "error", error: "they_requested_friends" });
    }
  } else {
    await sendFriendRequest(accountID, otherUserID);
    res.status(200);
    res.json({ status: "success" });
  }
});

/**
 * Accepts a friend request.
 * Params: otherUserID
 */
router.post("/accept_request", async (req, res) => {
  const { accountID } = req.session;
  const { otherUserID } = req.body;

  if (typeof otherUserID !== "string") {
    res.status(400);
    res.json({ status: "error", error: "invalid_other_user_id" });
    return;
  }

  let relationResult = await getUserRelationType({
    from_user: otherUserID,
    to_user: accountID,
  });
  if (
    relationResult.rowCount > 0 &&
    relationResult.rows[0].relation_type === "requested_friends"
  ) {
    makeFriendRelation({ user_a: accountID, user_b: otherUserID });
    res.json({ status: "success" });
  } else {
    res.status(401);
    res.json({ status: "error", error: "request_not_found" });
  }
});

/**
 * Denies a friend request.
 * Params: otherUserID
 */
router.post("/deny_request", async (req, res) => {
  const { accountID } = req.session;
  const { otherUserID } = req.body;

  if (typeof otherUserID !== "string") {
    res.status(400);
    res.json({ status: "error", error: "invalid_other_user_id" });
    return;
  }

  let relationResult = await getUserRelationType({
    from_user: otherUserID,
    to_user: accountID,
  });

  if (
    relationResult.rowCount > 0 &&
    relationResult.rows[0].relation_type === "requested_friends"
  ) {
    deleteFriendRequest({ to_user: accountID, from_user: otherUserID });
    res.json({ status: "success" });
  } else {
    res.json({ status: "error", error: "request_not_found" });
  }
});
