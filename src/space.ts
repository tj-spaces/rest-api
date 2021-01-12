export interface SpaceLocation {
  x: number;
  y: number;
}

export interface SpaceInhabitant {
  sessionId: string;
  temporaryId: string;
  accountId?: string;
  isGuest: boolean;
  displayName: string;
  displayColor: string;
  displayStatus: string;
  permissions: {
    present: boolean;
  };
  isAdministrator: boolean;
  isModerator: boolean;
  isForceMuted: boolean;
  isPresenting: boolean;
  location: SpaceLocation;
  rotation: number;
  lastPingSendTime: number;
  lastPingReceiveTime: number;
}

export class Space {
  inhabitants: Map<string, SpaceInhabitant>;
}
