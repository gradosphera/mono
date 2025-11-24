export interface MatrixUserDomainEntity {
  id: string;
  coopUsername: string; // username из кооператива
  matrixUserId: string; // @username:homeserver
  matrixUsername: string; // username без @
  createdAt: Date;
  updatedAt: Date;
}

export enum MatrixUserStatus {
  REGISTERED = 'registered',
  PENDING = 'pending',
  BLOCKED = 'blocked',
}
