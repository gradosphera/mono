import { MatrixUserDomainEntity } from '../../domain/entities/matrix-user.entity';
import { MatrixUserTypeormEntity } from '../entities/matrix-user.typeorm-entity';

export class MatrixUserMapper {
  static toDomain(entity: MatrixUserTypeormEntity): MatrixUserDomainEntity {
    return {
      id: entity.id,
      coopUsername: entity.coopUsername,
      matrixUserId: entity.matrixUserId,
      matrixUsername: entity.matrixUsername,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  static toEntity(domain: Omit<MatrixUserDomainEntity, 'id' | 'createdAt' | 'updatedAt'>): Partial<MatrixUserTypeormEntity> {
    return {
      coopUsername: domain.coopUsername,
      matrixUserId: domain.matrixUserId,
      matrixUsername: domain.matrixUsername,
    };
  }

  static toUpdateEntity(domain: Partial<MatrixUserDomainEntity>): Partial<MatrixUserTypeormEntity> {
    const update: Partial<MatrixUserTypeormEntity> = {};

    if (domain.coopUsername !== undefined) update.coopUsername = domain.coopUsername;
    if (domain.matrixUserId !== undefined) update.matrixUserId = domain.matrixUserId;
    if (domain.matrixUsername !== undefined) update.matrixUsername = domain.matrixUsername;

    return update;
  }
}
