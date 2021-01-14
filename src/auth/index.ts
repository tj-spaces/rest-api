import { Router } from "express";
import createSessionFromCodeAndProvider from "./createSessionFromCodeAndProvider";

const router = Router();

router.post("/create_session", (req, res) => {
  const { provider, code } = req.body;

  if (
    typeof provider !== "string" ||
    (provider !== "ion" && provider !== "google")
  ) {
    res.status(400);
    res.json({ error: "invalid_provider" });
    return;
  }

  if (typeof code !== "string") {
    res.status(400);
    res.json({ error: "invalid_code" });
  }

  res.json({
    session_id: createSessionFromCodeAndProvider(code, provider),
  });
});

router.get("/logout", (req, res) => {
  delete req.session.accountId;
  req.session.isLoggedIn = false;

  res.redirect("/");
});

router.get("/login-error", (req, res) => {
  res.status(400);
  res.render("login", {
    message: "There was a problem, try logging in again.",
    title: "Login Error",
  });
});

export { router };
