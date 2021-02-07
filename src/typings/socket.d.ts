import { Updater } from "queryshift";
import { Question } from "../spaces/QuestionAndAnswer";
import { SpaceParticipant } from "../spaces/SpaceParticipant";

declare module "socket.io" {
  interface Socket {
    emit(ev: "peer_joined", peer: SpaceParticipant): this;
    emit(ev: "peer_left", peerID: string): this;
    emit(ev: "peer_info", peer: SpaceParticipant): this;
    emit(ev: "ping", key: string, lastPingLatency: number): this;
    emit(
      ev: "chat_message",
      senderUserID: string,
      messageContent: string
    ): this;
    emit(ev: "peers", users: Map<string, SpaceParticipant>): this;
    emit(
      ev: "space_not_found" | "space_join_complete" | "unauthenticated"
    ): this;
    emit(ev: "twilio_grant", grant: string): this;
    emit(ev: "peer_update", peerID: string, peer: SpaceParticipant): this;
    emit(
      ev: "question",
      questionID: string,
      senderID: string,
      text: string
    ): this;
    emit(
      ev: "question_answer_added",
      questionID: string,
      senderID: string,
      text: string
    ): this;
    emit(ev: "question_answer_accepted", questionID: string): this;
    emit(ev: "question_list", questions: Question[]): this;

    on(ev: "chat_message", cb: (messageContent: string) => void): this;
    on(ev: "disconnect", cb: () => void): this;
    on(ev: "leave_space", cb: () => void): this;
    on(ev: "join_space", cb: (spaceID: string) => void): this;
    on(ev: "ping", cb: (key: string) => void): this;
    on(ev: "update", cb: (updates: Updater<SpaceParticipant>) => void): this;
    on(ev: "question", cb: (text: string) => void): this;
    on(
      ev: "answer_question",
      cb: (questionID: string, text: string) => void
    ): this;
    on(ev: "accept_question_answer", cb: (questionID: string) => void): this;
  }
}
