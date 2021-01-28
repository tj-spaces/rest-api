import { SpaceParticipant } from "../spaces/SpaceParticipant";

declare module "socket.io" {
  interface Socket {
    emit(ev: "peer_joined", peer: SpaceParticipant): this;
    emit(ev: "peer_left", peerId: string): this;
    emit(ev: "peer_info", peer: SpaceParticipant): this;
    emit(ev: "ping", key: string, lastPingLatency: number): this;
    emit(
      ev: "chat_message",
      senderUserId: string,
      messageContent: string
    ): this;
    emit(ev: "peers", users: Map<string, SpaceParticipant>): this;
    emit(
      ev: "space_not_found" | "space_join_complete" | "unauthenticated"
    ): this;
    emit(ev: "twilio_grant", grant: string): this;
    emit(ev: "peer_update", peerId: string, peer: SpaceParticipant): this;

    on(ev: "chat_message", cb: (messageContent: string) => void): this;
    on(ev: "disconnect", cb: () => void): this;
    on(ev: "leave_space", cb: () => void): this;
    on(ev: "join_space", cb: (spaceId: string) => void): this;
    on(ev: "ping", cb: (key: string) => void): this;
    on(ev: "walk", cb: (amt: number) => void): this;
    on(ev: "rotate", cb: (amt: number) => void): this;
  }
}
