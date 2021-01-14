import { Router } from "express";
import { getPublicSpaces } from "./server";

const router = Router();

router.get("/explore", (req, res) => {
  res.render("space_explorer", {
    title: "Explore spaces",
    publicSpaces: getPublicSpaces(),
  });
});

router.get("/create", (req, res) => {
  res.render("space_create", { title: "Create a space" });
});

export { router };
