import * as dotenv from "dotenv";
dotenv.config();

import * as auth from "./auth/index";
import { getUserFromId } from "./database/tables/users";
import * as bodyParser from "body-parser";
import * as express from "express";
import * as exphbs from "express-handlebars";
import * as http from "http";
import { getSessionMiddleware } from "./session";
import { createIo } from "./socket";
import { getSpaceServer } from "./spaces/server";
import * as spaces from "./spaces/routes";
import requireAuth from "./middleware/requireAuth";

const app = express();
const httpServer = http.createServer(app);
const io = createIo(httpServer);

app.set("view engine", "hbs");

app.engine(
  "hbs",
  exphbs({
    extname: "hbs",
    layoutsDir: "views/layouts",
    partialsDir: "views/partials",
  })
);

app.use("/static", express.static("static/"));

app.use(getSessionMiddleware());

app.use(bodyParser.urlencoded({ extended: true }));

app.use("/auth", auth.router);

app.use("/spaces", spaces.router);

app.use("/new-account", (req, res) => {
  res.render("new_account");
});

app.get("/space/:spaceId", requireAuth, async (req, res) => {
  const spaceId = parseInt(req.params.spaceId, 36);

  // Start up a space server if not loaded already
  const spaceServer = await getSpaceServer(spaceId, io);
  if (spaceServer) {
    const space = await spaceServer.getSpace();
    res.render("space", {
      title: space.name,
      name: space.name,
      spaceId,
    });
  } else {
    res.render("space_not_found");
  }
});

app.get("/profile", requireAuth, async (req, res) => {
  if (req.session.isLoggedIn) {
    res.render("profile", {
      title: "Profile",
      profile: await getUserFromId(req.session.accountId),
    });
  } else {
    res.render("please_login");
  }
});

app.get("/", (req, res) => {
  if (req.session.isLoggedIn) {
    res.render("index", { title: "Ping" });
  } else {
    res.render("login", { title: "Ping" });
  }
});

const port = process.env.PORT ?? 5000;

httpServer.listen(port, () => console.log("Listening on port", port));
