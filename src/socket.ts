import * as http from "http";
import { Server as SocketIOServer } from "socket.io";
import { getSpace } from "./space";
import { SPACE_NOT_FOUND } from "./packets";
import { getSessionMiddleware } from "./session";

export const createIo = (server: http.Server) => {
  const io = new SocketIOServer(server);

  io.use(getSessionMiddleware());

  io.on("connection", (socket: SocketIO.Socket) => {
    socket.on("disconnect", () => {
      socket.broadcast.emit("peer leave");
    });

    socket.on("request_join_space", (spaceId: string) => {
      const space = getSpace(spaceId);
      if (space == null) {
        socket.emit(SPACE_NOT_FOUND);
      } else {
        socket.broadcast.emit("peer join");
      }
    });
  });

  return io;
};
