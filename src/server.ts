import * as dotenv from "dotenv";
dotenv.config();

import * as api from "./api/index";
import * as auth from "./auth/index";
import * as bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import exphbs from "express-handlebars";
import * as http from "http";
import { getSessionMiddleware } from "./session";
import { createIo } from "./socket";
import { graphqlHTTP } from "express-graphql";
import { executableSchema } from "./graphql/graphql";
import isDevelopmentMode from "./lib/isDevelopment";
import { getLogger } from "./lib/ClusterLogger";

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

app.use(
  "/graphql",
  graphqlHTTP({ schema: executableSchema, graphiql: isDevelopmentMode() })
);

const logger = getLogger("requests");

app.use((req, res, next) => {
  logger({
    path: req.path,
    query: req.query,
    params: req.params,
    auth: req.headers.authorization,
  });
  next();
});

app.use(cors());

app.use(getSessionMiddleware());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/auth", auth.router);
app.use("/api", api.router);

const port = process.env.PORT ?? 5000;

httpServer.listen(port, () => console.log("Listening on port", port));
