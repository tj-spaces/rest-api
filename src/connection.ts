import { Server, Socket } from "socket.io";
import createUuid from "./lib/createUUID";
import { roomMap } from "./rooms";

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

  useListener: Socket["on"] = (...args) => {
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

export class RoomConnection extends Connection {
  private roomID: string | null;
  private io: Server;
  private accountID: string;

  constructor(socket: Socket, io: Server, accountID: string) {
    const onPingTimeout = () => {};

    super(socket, onPingTimeout);

    this.io = io;
    this.roomID = null;
    this.accountID = accountID;

    this.addListeners();
  }

  leaveRoom() {
    if (this.roomID != null) {
      this.sendParticipantLeft();
      roomMap[this.roomID].participants = roomMap[
        this.roomID
      ].participants.filter((id) => id !== this.accountID);
      this.socket.leave(`room$${this.roomID}`);
      this.roomID = null;
    }
  }

  private broadcastJoinedRoom() {
    this.broadcastToRoom().emit("participant-joined", { id: this.accountID });
  }

  private sendParticipants(participants: any[]) {
    for (let participantID of participants) {
      if (participantID !== this.accountID) {
        this.sendParticipantJoined(participantID);
      }
    }
  }

  private sendParticipantJoined(participantID: string) {
    this.socket.emit("participant-joined", { id: participantID });
  }

  joinRoom(roomID: string) {
    this.roomID = roomID;
    this.socket.join(`room$${roomID}`);
    this.sendRoomJoinConfirmed(roomID);
    this.broadcastJoinedRoom();
    this.sendParticipants(roomMap[this.roomID].participants);
  }

  toRoom() {
    if (this.roomID == null) {
      console.warn("sending to clients in room: roomID is null");
    }
    return this.io.in(`room$${this.roomID}`);
  }

  broadcastToRoom() {
    if (this.roomID == null) {
      console.warn("broadcasting to room: roomID is null");
    }
    return this.socket.in(`room$${this.roomID}`).broadcast;
  }

  sendParticipantLeft() {
    this.toRoom().emit("participant-left", this.accountID);
  }

  sendRoomJoinConfirmed(roomID: string) {
    this.socket.emit("joined-room", roomID);
  }

  private addListeners() {
    this.socket.on("disconnect", () => {
      this.leaveRoom();
    });

    this.socket.on("join-room", (roomID: string) => {
      if (!(roomID in roomMap)) {
        roomMap[roomID] = { participants: [] };
      }
      roomMap[roomID].participants.push(this.accountID);

      this.joinRoom(roomID);

      this.roomID = roomID;
    });

    this.socket.on("leave-room", () => {
      console.log("participant is leaving room: ", this.accountID);
      this.leaveRoom();
    });
  }
}
