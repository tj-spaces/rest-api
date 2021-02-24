import * as dotenv from "dotenv";
dotenv.config();

import * as api from "./api/index";
import * as auth from "./auth/index";
import * as bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import * as http from "http";
import { createIO } from "./socket";
// import { graphqlHTTP } from "express-graphql";
// import { executableSchema } from "./graphql/graphql";
// import isDevelopmentMode from "./lib/isDevelopment";
import { getLogger } from "./lib/ClusterLogger";
import { sessionMiddleware } from "./session";

const app = express();
const httpServer = http.createServer(app);
const io = createIO(httpServer);

const logger = getLogger("requests");

app.use((req, res, next) => {
  let startTime = new Date().getTime();
  res.on("finish", () => {
    let endTime = new Date().getTime();
    let duration = endTime - startTime;
    logger({
      path: req.path,
      // query: req.query,
      params: req.params,
      // auth: req.headers.authorization,
      // startTime,
      // endTime,
      duration,
    });
  });
  next();
});

app.use(cors());

app.use(sessionMiddleware);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/auth", auth.router);
app.use("/api", api.router);

// app.use(
//   "/graphql",
//   graphqlHTTP({ schema: executableSchema, graphiql: isDevelopmentMode() })
// );

const port = process.env.PORT ?? 5000;

httpServer.listen(port, () => console.log("Listening on port", port));
