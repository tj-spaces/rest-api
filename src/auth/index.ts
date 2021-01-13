import * as google from "./google/routes";
import * as ion from "./ion/routes";
import { Router } from "express";

const router = Router();

router.use("/google", google.router);
router.use("/ion", ion.router);

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
