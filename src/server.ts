import * as express from "express";
import * as exphbs from "express-handlebars";
import * as http from "http";
import { Server as SocketIOServer } from "socket.io";
import * as path from "path";

const localFile = (filename: string) => path.join(process.cwd(), filename);

const app = express();
const httpServer = http.createServer(app);
const io = new SocketIOServer(httpServer);

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
    res.render("space", { title: name, name, createdBy });
  } else {
    res.render("space_not_found");
  }
});

app.get("/create-space", (req, res) => {
  res.render("space_create");
});

app.get("/", (req, res) => {
  res.render("index", { title: "Ping" });
});

io.on("connection", (socket: SocketIO.Socket) => {
  console.log("Client connected");
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

const port = process.env.PORT ?? 5000;

httpServer.listen(port, () => console.log(`Listening on *:${port}`));
