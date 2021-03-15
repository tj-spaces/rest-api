/*
  Copyright (C) Michael Fatemi - All Rights Reserved.
  Unauthorized copying of this file via any medium is strictly prohibited.
  Proprietary and confidential.
  Written by Michael Fatemi <myfatemi04@gmail.com>, February 2021.
*/
import * as dotenv from "dotenv";
dotenv.config();

import * as api from "./api/index";
import * as auth from "./auth/index";
import * as analytics from "./analytics/analytics";
import * as bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import * as http from "http";
import { getLogger } from "./lib/ClusterLogger";
import { sessionMiddleware } from "./session";

const app = express();
const httpServer = http.createServer(app);

const logger = getLogger("requests");

app.use((req, res, next) => {
  let startTime = new Date().getTime();
  res.on("finish", () => {
    let endTime = new Date().getTime();
    let duration = endTime - startTime;
    logger({
      path: req.path,
      query: req.query,
      params: req.params,
      auth: req.headers.authorization,
      ip: req.ip,
      duration,
    });
  });
  next();
});

app.use(cors());

app.use(sessionMiddleware);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/healthcheck", (req, res) => {
  res.status(200);
  res.json({ status: "ok" });
});
app.use("/auth", auth.router);
app.use("/api", api.router);
app.use("/analytics", analytics.router);

const port = process.env.PORT ?? 5000;

console.log("Added routes");

httpServer.listen(port, () => console.log("Listening on port", port));
