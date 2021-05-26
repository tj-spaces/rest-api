/*
  Copyright (C) Michael Fatemi - All Rights Reserved.
  Unauthorized copying of this file via any medium is strictly prohibited.
  Proprietary and confidential.
  Written by Michael Fatemi <myfatemi04@gmail.com>, February 2021.
*/
import * as http from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import { getSessionDataByID } from "./session";
import { getUserFromID } from "./database/tables/users";
import { getLogger } from "./lib/ClusterLogger";
import { Connection, RoomConnection } from "./connection";

export function emitToChannel() {}

const logger = getLogger("space");

/**
 * Sets up the callbacks and returns a newly-created Socket.io instance
 * @param server The http server to bind to
 */
export const createIO = (server: http.Server) => {
  const io = new SocketIOServer(server, {
    cors: { origin: "*" },
  });

  io.on("connection", async (socket: Socket) => {
    const sessionID = socket.handshake.query.sessionID;
    const session = await getSessionDataByID(sessionID as string);

    if (session == null || session.accountID == null) {
      logger("socket not authenticated");

      socket.emit("unauthenticated");
      return;
    }

    const accountID = session.accountID;

    new RoomConnection(socket, io, accountID);

    logger("socket authenticated: account id is " + accountID);
  });

  return io;
};
