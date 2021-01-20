import { Router } from "express";
import { getChannelsInSpace } from "../../database/tables/channels";
import { createSpace, getPublicSpaces } from "../../database/tables/spaces";
import {
  isUserInSpace,
  getSpacesWithMember,
} from "../../database/tables/space_members";
import requireApiAuth from "../../middleware/requireApiAuth";

const router = Router();

/**
 * Requires params:
 *  - `name`: string, max 256 chars
 *  - `visibility`: either 'public' or 'unlisted'
 * Requires authentication
 */
router.post("/create", requireApiAuth, (req, res) => {
  const { visibility, name } = req.query;
  const { accountId } = req.session;

  if (typeof name !== "string" || name.length > 255) {
    res.status(400);
    res.json({
      error: "invalid_name",
      message: "Name must be string and <256 chars",
    });
    return;
  }

  if (visibility !== "public" && visibility !== "unlisted") {
    res.status(400);
    res.json({ error: "invalid_visibility" });
    return;
  }

  createSpace(accountId, name, visibility)
    .then((id) => {
      res.status(200);
      res.json({ status: "success", id });
    })
    .catch((err) => {
      console.error("Error when creating a space: ", err);
      res.status(500);
      res.json({ error: "internal_server_error" });
    });
});

/**
 * Gets a list of channels in this space.
 */
router.get("/channels", requireApiAuth, async (req, res) => {
  const { accountId } = req.session;

  if (typeof req.query.space_id !== "string") {
    res.status(400);
    res.json({ error: "invalid_group_id" });
    return;
  }

  const spaceId = req.query.space_id;
  const inSpace = await isUserInSpace(spaceId, accountId);

  if (!inSpace) {
    res.status(401);
    res.json({ error: "not_in_space" });
  } else {
    // If we are in the group, then the group must exist
    res.json({ status: "success", channels: getChannelsInSpace(spaceId) });
  }
});

router.get("/list", requireApiAuth, async (req, res) => {
  const { accountId } = req.session;
  const spaces = await getSpacesWithMember(accountId);
  res.json({ status: "success", spaces });
});

router.get("/public", async (req, res) => {
  res.json(await getPublicSpaces());
});

export { router };
