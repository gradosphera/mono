import { MatrixTokenDomainEntity } from '../entities/matrix-token.entity';

export interface MatrixTokenRepository {
  create(token: Omit<MatrixTokenDomainEntity, 'id' | 'createdAt'>): Promise<MatrixTokenDomainEntity>;
  findByToken(token: string): Promise<MatrixTokenDomainEntity | null>;
  findByCoopUsername(coopUsername: string): Promise<MatrixTokenDomainEntity[]>;
  findValidByCoopUsername(coopUsername: string): Promise<MatrixTokenDomainEntity | null>;
  markAsUsed(id: string): Promise<void>;
  deleteExpired(): Promise<void>;
  findById(id: string): Promise<MatrixTokenDomainEntity | null>;
}

export const MATRIX_TOKEN_REPOSITORY = Symbol('MatrixTokenRepository');
