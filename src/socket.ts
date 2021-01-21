import * as http from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import { getSpaceServer } from "./spaces/server";
import { getSessionDataById, getSessionMiddleware } from "./session";
import { getUserFromId } from "./database/tables/users";
import { createMessage } from "./database/tables/messages";
import isDevelopmentMode from "./lib/isDevelopment";
import createUuid from "./lib/createUuid";

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

  constructor(public socket: Socket) {
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

export function emitToChannel() {}

export function sendMessage(
  channelId: string,
  senderId: string,
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
  const io = new SocketIOServer(server, {
    cors: {
      origin: "*",
    },
  });

  io.use((socket, next) => {
    // @ts-ignore
    getSessionMiddleware()(socket.request, {}, next);
  });

  io.on("connection", (socket: Socket) => {
    const sessionId = socket.handshake.query["sessionId"];
    const session = getSessionDataById(sessionId);

    if (session == null || session.isLoggedIn == false) {
      socket.emit("unauthenticated");
      return;
    }

    socket.on("disconnect", () => {
      socket.broadcast.emit("peer_left");
    });

    socket.on("join_space", async (spaceId: string) => {
      const spaceServer = await getSpaceServer(spaceId, io);
      if (spaceServer == null) {
        socket.emit("space_not_found");
      } else {
        let user = await getUserFromId(session.accountId);
        spaceServer.tryJoin(socket, user.name);
      }
    });
  });

  return io;
};
