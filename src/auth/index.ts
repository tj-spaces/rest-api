import { Router } from "express";
import createSessionFromCodeAndProvider from "./createSessionFromCodeAndProvider";

const router = Router();

router.post("/create_session", async (req, res) => {
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

  try {
    const session_id = await createSessionFromCodeAndProvider(code, provider);

    res.status(200);
    res.json({
      session_id: session_id,
    });
  } catch (e) {
    console.error("ERROR DURING CODE REQUEST");
    res.json({
      error: "invalid_code",
    });
    res.status(400);
  }
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
