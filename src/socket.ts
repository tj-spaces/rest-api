/*
  Copyright (C) Michael Fatemi - All Rights Reserved.
  Unauthorized copying of this file via any medium is strictly prohibited.
  Proprietary and confidential.
  Written by Michael Fatemi <myfatemi04@gmail.com>, February 2021.
*/
import * as http from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import { getSpaceServer } from "./spaces/server";
import { getSessionDataByID, sessionMiddleware } from "./session";
import { getUserFromID } from "./database/tables/users";
import createUuid from "./lib/createUUID";

const PING_SEND_INTERVAL = 5000;
const PING_TIMEOUT = 60000;

export class Connection {
  /**
   * UNIX time for when the last ping was sent
   */
  lastPingSendTime?: number;

  /**
   * UNIX time for when the last ping was received
   */
  lastPingReceiveTime?: number;

  /**
   * Key for the last ping
   */
  pingKey: string;

  /**
   * Time since last ping was received
   */
  latency: number = 0;

  /**
   * We have a timer to keep track of if someone's timed out
   */
  pingTimeoutHandle: NodeJS.Timeout;

  listeners: Parameters<Socket["on"]>[] = [];

  constructor(public socket: Socket, onPingTimeout: () => void) {
    socket.on("ping", (key) => {
      if (key === this.pingKey) {
        this.lastPingReceiveTime = Date.now();
        this.latency = this.lastPingReceiveTime - this.lastPingSendTime;

        if (this.pingTimeoutHandle != null) {
          clearTimeout(this.pingTimeoutHandle);
        }

        // Send a max of one ping every 500 ms
        let timeToWaitUntilNextPing = Math.max(
          0,
          PING_SEND_INTERVAL - this.latency
        );

        setTimeout(() => {
          this.sendPing();
          this.pingTimeoutHandle = setTimeout(() => {
            onPingTimeout();
          }, PING_TIMEOUT);
        }, timeToWaitUntilNextPing);
      }
    });

    this.sendPing();
  }

  // @ts-expect-error
  useListener: Socket["on"] = (...args: Parameters<Socket["on"]>) => {
    return this.socket.on(...args);
  };

  destroyListeners = () => {
    for (let args of this.listeners) {
      this.socket.off(...args);
    }
  };

  sendPing() {
    this.pingKey = createUuid();
    this.lastPingSendTime = Date.now();
    this.socket.emit("ping", this.pingKey, this.latency);
  }
}

export function emitToChannel() {}

const accountConnections = new Map<string, Connection>();

/**
 * Sets up the callbacks and returns a newly-created Socket.io instance
 * @param server The http server to bind to
 */
export const createIO = (server: http.Server) => {
  const io = new SocketIOServer(server, {
    cors: { origin: "*" },
  });

  io.use((socket, next) => {
    console.log("Handling socket", socket);
    sessionMiddleware(
      // @ts-expect-error
      socket.request,
      {},
      next
    );
  });

  io.on("connection", async (socket: Socket) => {
    const sessionID = socket.handshake.query.sessionID;
    const session = await getSessionDataByID(sessionID as string);

    if (session == null || session.accountID == null) {
      socket.emit("unauthenticated");
      return;
    }

    socket.on("disconnect", () => {
      socket.broadcast.emit("peer_left");
    });

    socket.on("join-room", (roomID: string) => {
      socket.emit("joined-room", roomID);
    });

    socket.on("join_space", async (spaceID: string) => {
      const spaceServer = await getSpaceServer(spaceID, io);
      if (spaceServer == null) {
        socket.emit("space_not_found");
      } else {
        let user = await getUserFromID(session.accountID);
        spaceServer.tryJoin(socket, user.name);
      }
    });
  });

  return io;
};
