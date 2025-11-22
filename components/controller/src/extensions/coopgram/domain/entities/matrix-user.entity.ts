export interface MatrixUserDomainEntity {
  id: string;
  coopUsername: string; // username из кооператива
  matrixUserId: string; // @username:homeserver
  matrixUsername: string; // username без @
  matrixAccessToken: string;
  matrixDeviceId: string;
  matrixHomeServer: string;
  isRegistered: boolean;
  lastTokenRefresh: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum MatrixUserStatus {
  REGISTERED = 'registered',
  PENDING = 'pending',
  BLOCKED = 'blocked',
}
