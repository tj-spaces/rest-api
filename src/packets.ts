interface Profile {
  id: string;
  name: string;
  username: string;
  profilePhotoUrl?: string;
  isGuest: boolean;
}

interface UserInfoPacket {
  type: "user_info";
  user: Profile;
}

interface UserJoinPacket {
  type: "user_join";
  user: Profile;
}

interface UserLeavePacket {
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

interface Position2D {
  x: number;
  z: number;
  rotation: number;
}

type UserPositions = Map<string, Position2D>;

interface UserPositionsPacket {
  type: "user_positions";
  positions: UserPositions;
}

interface UsersInRoomPacket {
  type: "users_in_room";
  users: Profile[];
}

interface ChatMessage {
  senderUserId: string;
  messageContent: string;
}

interface ChatMessagePacket {
  type: "chat_message";
  message: ChatMessage;
}

interface PingPacket {
  type: "ping";
}

export type Packet =
  | UserInfoPacket
  | UserJoinPacket
  | UserLeavePacket
  | UserPositionsPacket
  | UsersInRoomPacket
  | ChatMessagePacket;
