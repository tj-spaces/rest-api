import * as dotenv from "dotenv";
dotenv.config();

import * as api from "./api/index";
import * as auth from "./auth/index";
import { getUserFromId } from "./database/tables/users";
import * as bodyParser from "body-parser";
import * as cors from "cors";
import * as express from "express";
import * as exphbs from "express-handlebars";
import * as http from "http";
import { getSessionMiddleware } from "./session";
import { createIo } from "./socket";
import { getSpaceServer } from "./spaces/server";
import * as spaces from "./spaces/routes";
import requireAuth from "./middleware/requireAuth";
// import { ExpressPeerServer } from "peer";

const app = express();
const httpServer = http.createServer(app);
const io = createIo(httpServer);
// const peerServer = ExpressPeerServer(httpServer, {
//   path: "/peerjs",
// });

// app.use("/peerjs", peerServer);

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

app.use(cors());

app.use(getSessionMiddleware());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/auth", auth.router);
app.use("/spaces", spaces.router);
app.use("/api", api.router);

app.use("/new-account", (req, res) => {
  res.render("new_account");
});

app.get("/space/:spaceId", requireAuth, async (req, res) => {
  const { spaceId } = req.params;

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

import { getDatabaseConnection } from "./database/index";
(async () => {
  const db = await getDatabaseConnection();
  db.query("SELECT * FROM `users`", [], (err, results) => {
    console.log(typeof results[2].id);
  });
})();

const port = process.env.PORT ?? 5000;

httpServer.listen(port, () => console.log("Listening on port", port));
