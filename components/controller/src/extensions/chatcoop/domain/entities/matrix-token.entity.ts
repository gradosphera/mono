export interface MatrixTokenDomainEntity {
  id: string;
  coopUsername: string;
  matrixUserId: string;
  token: string;
  expiresAt: Date;
  isUsed: boolean;
  createdAt: Date;
}
