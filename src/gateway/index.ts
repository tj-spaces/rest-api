import { subscribe, unsubscribe } from "./redisUtil";
import { getSessionDataByID } from "../session";

class GatewayConnection {
  constructor(private socket: SocketIO.Socket, private accountID: string) {
    const onMessage = (message: string) => {
      socket.emit("mq", message);
    };

    subscribe("user:" + accountID, onMessage);

    socket.on("disconnect", () => {
      unsubscribe("user:" + accountID, onMessage);
    });
  }
}

/**
 * The Gateway handler registers a connection. This will send updates to the
 * client as they arrive in Redis.
 * @param io The socket.io server handler
 */
export function addGatewayRoutes(io: SocketIO.Server) {
  io.of("/gateway").on("connection", (socket) => {
    const sessionID = socket.handshake.query["sessionID"];
    const session = getSessionDataByID(sessionID);

    if (session.accountID) {
    } else {
      socket.emit("unauthenticated");
    }
  });
}
