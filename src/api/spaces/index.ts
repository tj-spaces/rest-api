import { Router } from "express";
import { createSpace, getPublicSpaces } from "../../database/tables/spaces";
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

  createSpace(accountId, name, visibility);
});

router.get("/public", (req, res) => {
  res.json(getPublicSpaces());
});

export { router };
