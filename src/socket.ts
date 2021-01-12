import * as http from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import { getSpace } from "./space";
import { getSessionMiddleware } from "./session";
import { ParamsDictionary, Request } from "express-serve-static-core";
import { ParsedQs } from "qs";
import createUuid from "./lib/createUuid";

type ResBody = any;
type ReqBody = any;
type ReqQuery = ParsedQs;

export interface CustomSocket extends Socket {
  request: Request<ParamsDictionary, ResBody, ReqBody, ReqQuery>;
}

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
    const { session } = socket.request;
    if (!session.temporaryId) {
      session.temporaryId = createUuid();
    }

    socket.on("disconnect", () => {
      socket.broadcast.emit("peer_left");
    });

    socket.on("join_space", (spaceId: string) => {
      const space = getSpace(spaceId);
      if (space == null) {
        socket.emit("space_not_found");
      } else {
        space.tryJoin(socket);
      }
    });
  });

  return io;
};
