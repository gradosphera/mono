import { MatrixTokenDomainEntity } from '../../domain/entities/matrix-token.entity';
import { MatrixTokenTypeormEntity } from '../entities/matrix-token.typeorm-entity';

export class MatrixTokenMapper {
  static toDomain(entity: MatrixTokenTypeormEntity): MatrixTokenDomainEntity {
    return {
      id: entity.id,
      coopUsername: entity.coopUsername,
      matrixUserId: entity.matrixUserId,
      token: entity.token,
      expiresAt: entity.expiresAt,
      isUsed: entity.isUsed,
      createdAt: entity.createdAt,
    };
  }

  static toEntity(domain: Omit<MatrixTokenDomainEntity, 'id' | 'createdAt'>): Partial<MatrixTokenTypeormEntity> {
    return {
      coopUsername: domain.coopUsername,
      matrixUserId: domain.matrixUserId,
      token: domain.token,
      expiresAt: domain.expiresAt,
      isUsed: domain.isUsed,
    };
  }
}
