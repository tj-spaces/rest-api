import * as cors from "cors";
import * as http from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import { getSpaceServer } from "./spaces/server";
import { getSessionDataById, getSessionMiddleware } from "./session";
import { ParamsDictionary, Request } from "express-serve-static-core";
import { ParsedQs } from "qs";
import { getUserFromId } from "./database/tables/users";
import { createMessage } from "./database/tables/messages";
import isDevelopmentMode from "./lib/isDevelopment";
import createUuid from "./lib/createUuid";

type ResBody = any;
type ReqBody = any;
type ReqQuery = ParsedQs;

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

  latency: number = 0;

  constructor(public socket: CustomSocket) {
    socket.on("ping", (key) => {
      if (key === this.pingKey) {
        this.lastPingReceiveTime = Date.now();
        this.latency = this.lastPingReceiveTime - this.lastPingSendTime;

        // Send a max of one ping every 500 ms
        let timeToWaitUntilNextPing = Math.max(0, 500 - this.latency);
        setTimeout(() => this.sendPing(), timeToWaitUntilNextPing);
      }
    });

    if (!isDevelopmentMode()) {
      this.sendPing();
    }
  }

  sendPing() {
    this.pingKey = createUuid();
    this.lastPingSendTime = Date.now();
    this.socket.emit("ping", this.pingKey, this.latency);
  }
}

export interface CustomSocket extends Socket {
  request: Request<ParamsDictionary, ResBody, ReqBody, ReqQuery>;
}

export function emitToChannel() {}

export function sendMessage(
  channelId: number,
  senderId: number,
  message: string
) {
  createMessage(channelId, senderId, message);
}

const accountConnections = new Map<string, Connection>();

/**
 * Sets up the callbacks and returns a newly-created Socket.io instance
 * @param server The http server to bind to
 */
export const createIo = (server: http.Server) => {
  const io = new SocketIOServer(server);

  io.use((socket, next) => {
    // @ts-ignore
    getSessionMiddleware()(socket.request, {}, next);
  });

  io.on("connection", (socket: CustomSocket) => {
    const sessionId = socket.handshake.query["sessionId"];
    const session = getSessionDataById(sessionId);

    if (session == null) {
      socket.emit("unauthenticated");
      return;
    }

    const accountId = session.accountId;

    socket.on("disconnect", () => {
      socket.broadcast.emit("peer_left");
    });

    socket.on("chat_message", (messageContent, channelId) => {
      createMessage(channelId, accountId, messageContent);
    });

    socket.on("join_space", async (spaceId: number, displayName?: string) => {
      const spaceServer = await getSpaceServer(spaceId, io);
      if (spaceServer == null) {
        socket.emit("space_not_found");
      } else {
        if (socket.request.session.isLoggedIn) {
          let user = await getUserFromId(socket.request.session.accountId);
          displayName = user.name;
        }

        spaceServer.tryJoin(socket, displayName);
      }
    });
  });

  return io;
};
