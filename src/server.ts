import cookieSession = require("cookie-session");
import * as dotenv from "dotenv";
import * as express from "express";
import * as exphbs from "express-handlebars";
import * as http from "http";
import * as path from "path";
import * as auth from "./auth";
import { createIo } from "./socket";
dotenv.config();

const app = express();
const httpServer = http.createServer(app);
createIo(httpServer);

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

app.use(
  cookieSession({
    secret: process.env.SESSION_SECRET,
    keys: [process.env.SESSION_KEY_0, process.env.SESSION_KEY_1],
    name: "ping",
  })
);

auth.bootloadAuthMethods();
app.use("/auth", auth.router);

const spaces = {
  tourist: {
    name: "First Space",
    createdBy: "michael",
  },
};

app.get("/space/:spaceId", (req, res) => {
  const { spaceId } = req.params;
  if (spaceId in spaces) {
    const { name, createdBy } = spaces[spaceId];
    res.render("space", { title: name, name, createdBy, spaceId });
  } else {
    res.render("space_not_found");
  }
});

app.get("/create-space", (req, res) => {
  res.render("space_create");
});

app.get("/", (req, res) => {
  if (req.session.loggedIn) {
    res.render("index", { title: "Ping" });
  } else {
    res.render("login", { title: "Ping" });
  }
});

const port = process.env.PORT ?? 5000;

httpServer.listen(port, () => console.log(`Listening on *:${port}`));
