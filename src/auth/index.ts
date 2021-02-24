import { Router } from "express";
import { redis } from "../redis";
import createSessionFromCodeAndProvider from "./createSessionFromCodeAndProvider";

export const router = Router();

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
    return;
  }

  try {
    const session_id = await createSessionFromCodeAndProvider(code, provider);
    res.status(200);
    res.json({
      session_id,
    });
  } catch (e) {
    console.error("Error creating session:", e.message);
    res.json({
      error: "invalid_code",
    });
    res.status(400);
  }
});

router.get("/purge_session", (req, res) => {
  const auth = req.headers.authorization;
  if (typeof auth === "string" && auth.startsWith("Bearer ")) {
    const token = auth.slice(7);
    redis.DEL("session.user_id:" + token, (err) =>
      err ? res.status(500) : res.status(200)
    );
  } else {
    res.status(200);
  }
});
