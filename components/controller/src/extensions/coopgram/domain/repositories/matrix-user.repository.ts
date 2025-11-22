import { MatrixUserDomainEntity } from '../entities/matrix-user.entity';

export interface MatrixUserRepository {
  create(user: Omit<MatrixUserDomainEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<MatrixUserDomainEntity>;
  findByCoopUsername(coopUsername: string): Promise<MatrixUserDomainEntity | null>;
  findByMatrixUserId(matrixUserId: string): Promise<MatrixUserDomainEntity | null>;
  findById(id: string): Promise<MatrixUserDomainEntity | null>;
  update(id: string, user: Partial<MatrixUserDomainEntity>): Promise<MatrixUserDomainEntity>;
  delete(id: string): Promise<void>;
  findAll(): Promise<MatrixUserDomainEntity[]>;
}

export const MATRIX_USER_REPOSITORY = Symbol('MatrixUserRepository');
