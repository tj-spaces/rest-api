import { Socket } from "dgram";
import * as http from "http";
import { Server as SocketIOServer } from "socket.io";

export const createIo = (server: http.Server) => {
  const io = new SocketIOServer(server);

  io.on("connection", (socket: SocketIO.Socket) => {
    socket.on("disconnect", () => {
      socket.broadcast.emit("peer leave");
    });

    socket.on("join space", (spaceId) => {
      console.log("Client joined space", spaceId);
      socket.join(spaceId);
      socket.broadcast.emit("peer join");
    });
  });

  return io;
};
