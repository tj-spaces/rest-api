interface Profile {
  id: string;
  name: string;
  username: string;
  profilePhotoUrl?: string;
  isGuest: boolean;
}

interface UserInfoOutboundPacket {
  type: "user_info";
  user: Profile;
}

interface UserJoinOutboundPacket {
  type: "user_join";
  user: Profile;
}

interface UserLeaveOutboundPacket {
  type: "user_leave";
  userId: string;
}

interface Position3D {
  x: number;
  y: number;
  z: number;
  rotation_x: number;
  rotation_y: number;
  rotation_z: number;
}

/**
 * Where something is in the space.
 * This is a 2D location, because as of now, the spaces are "2.5-dimensional" worlds
 */
interface Position2D {
  x: number;
  z: number;
  rotation: number;
}

type UserPositions = Map<string, Position2D>;

interface UserPositionsOutboundPacket {
  type: "user_positions";
  positions: UserPositions;
}

interface UsersInRoomOutboundPacket {
  type: "users_in_room";
  users: Profile[];
}

interface ChatMessageInboundPacket {
  type: "chat_message";
  messageText: string;
}

interface ChatMessage {
  senderUserId: string;
  messageContent: string;
}

interface ChatMessageOutboundPacket {
  type: "chat_message";
  message: ChatMessage;
}

interface PingPacket {
  type: "ping";

  /**
   * Used to correlate pings with each other
   */
  key: string;
}

interface SpaceNotFoundOutboundPacket {
  type: "space_not_found";
}

export const SPACE_NOT_FOUND = "space_not_found";

interface SpaceFoundInboundPacket {
  type: "space_found";
}

export type OutboundPacket =
  | UserInfoOutboundPacket
  | UserJoinOutboundPacket
  | UserLeaveOutboundPacket
  | UserPositionsOutboundPacket
  | UsersInRoomOutboundPacket
  | ChatMessageOutboundPacket
  | PingPacket;

export type InboundPacket = ChatMessageInboundPacket;
