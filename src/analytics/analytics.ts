import { Router } from "express";

export const router = Router();

router.post("/error", (req, res) => {
  let body = req.body;
  if (!("error" in body)) {
    console.warn("Received malformed Error log:", body);
    res.status(400);
    res.end();
  } else {
    console.error("CLIENT ERROR:", body.error);
    res.status(200);
    res.end();
  }
});
