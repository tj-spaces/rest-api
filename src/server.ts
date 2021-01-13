import * as dotenv from "dotenv";
dotenv.config();

import * as express from "express";
import * as exphbs from "express-handlebars";
import * as http from "http";
import { getUserFromId } from "./auth/accountUtil";
import * as auth from "./auth/index";
import { getSessionMiddleware } from "./session";
import { createIo } from "./socket";
import { createSpace, getPublicSpaces, getSpace } from "./space";

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

app.use("/auth", auth.router);

createSpace(
  "tourist",
  {
    waitingRoom: false,
    loginRequiredToJoin: false,
    name: "First Space",
    createdBy: "michael",
    isPublic: true,
  },
  io
);

app.get("/spaces/explore", (req, res) => {
  res.render("space_explorer", { publicSpaces: getPublicSpaces() });
});

app.get("/spaces/create", (req, res) => {
  res.render("space_create");
});

app.get("/space/:spaceId", (req, res) => {
  const { spaceId } = req.params;
  const space = getSpace(spaceId);
  if (space) {
    const { name, createdBy } = space;
    res.render("space", {
      title: name,
      name,
      createdBy,
      spaceId,
      layout: "fullscreen",
    });
  } else {
    res.render("space_not_found");
  }
});

app.get("/profile", async (req, res) => {
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
