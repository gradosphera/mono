import { MatrixUserDomainEntity } from '../../domain/entities/matrix-user.entity';
import { MatrixUserTypeormEntity } from '../entities/matrix-user.typeorm-entity';

export class MatrixUserMapper {
  static toDomain(entity: MatrixUserTypeormEntity): MatrixUserDomainEntity {
    return {
      id: entity.id,
      coopUsername: entity.coopUsername,
      matrixUserId: entity.matrixUserId,
      matrixUsername: entity.matrixUsername,
      matrixAccessToken: entity.matrixAccessToken,
      matrixDeviceId: entity.matrixDeviceId,
      matrixHomeServer: entity.matrixHomeServer,
      isRegistered: entity.isRegistered,
      lastTokenRefresh: entity.lastTokenRefresh,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  static toEntity(domain: Omit<MatrixUserDomainEntity, 'id' | 'createdAt' | 'updatedAt'>): Partial<MatrixUserTypeormEntity> {
    return {
      coopUsername: domain.coopUsername,
      matrixUserId: domain.matrixUserId,
      matrixUsername: domain.matrixUsername,
      matrixAccessToken: domain.matrixAccessToken,
      matrixDeviceId: domain.matrixDeviceId,
      matrixHomeServer: domain.matrixHomeServer,
      isRegistered: domain.isRegistered,
      lastTokenRefresh: domain.lastTokenRefresh,
    };
  }

  static toUpdateEntity(domain: Partial<MatrixUserDomainEntity>): Partial<MatrixUserTypeormEntity> {
    const update: Partial<MatrixUserTypeormEntity> = {};

    if (domain.coopUsername !== undefined) update.coopUsername = domain.coopUsername;
    if (domain.matrixUserId !== undefined) update.matrixUserId = domain.matrixUserId;
    if (domain.matrixUsername !== undefined) update.matrixUsername = domain.matrixUsername;
    if (domain.matrixAccessToken !== undefined) update.matrixAccessToken = domain.matrixAccessToken;
    if (domain.matrixDeviceId !== undefined) update.matrixDeviceId = domain.matrixDeviceId;
    if (domain.matrixHomeServer !== undefined) update.matrixHomeServer = domain.matrixHomeServer;
    if (domain.isRegistered !== undefined) update.isRegistered = domain.isRegistered;
    if (domain.lastTokenRefresh !== undefined) update.lastTokenRefresh = domain.lastTokenRefresh;

    return update;
  }
}
