import { Router } from "express";
import { createSpace, getPublicSpaces } from "../database/tables/spaces";
import requireAuth from "../middleware/requireAuth";
import requireAuthPostRequest from "../middleware/requireAuthPostRequest";

const router = Router();

router.get("/explore", (req, res) => {
  res.render("space_explorer", {
    title: "Explore spaces",
    publicSpaces: getPublicSpaces(),
  });
});

router.get("/create", requireAuth, (req, res) => {
  res.render("space_create", { title: "Create a space" });
});

router.post("/create", requireAuthPostRequest, (req, res) => {
  if (!req.session.isLoggedIn) {
    return res.status(401);
  }

  let { name, visibility } = req.body;

  if (typeof name !== "string") {
    return res.status(400);
  }

  if (visibility !== "public" && visibility !== "unlisted") {
    return res.status(400);
  }

  let { accountId } = req.session;

  createSpace(accountId, name, visibility).then((id) => {
    res.redirect("/space/" + id);
  });
});

export { router };
