import { UnionChatDomainEntity } from '../../domain/entities/union-chat.entity';
import { UnionChatTypeormEntity } from '../entities/union-chat.typeorm-entity';

export class UnionChatMapper {
  static toDomain(entity: UnionChatTypeormEntity): UnionChatDomainEntity {
    return {
      id: entity.id,
      coopUsername: entity.coopUsername,
      matrixUserId: entity.matrixUserId,
      roomId: entity.roomId,
      unionPersonId: entity.unionPersonId,
      unionName: entity.unionName,
      createdAt: entity.createdAt,
    };
  }

  static toEntity(domain: Omit<UnionChatDomainEntity, 'id' | 'createdAt'>): Partial<UnionChatTypeormEntity> {
    return {
      coopUsername: domain.coopUsername,
      matrixUserId: domain.matrixUserId,
      roomId: domain.roomId,
      unionPersonId: domain.unionPersonId,
      unionName: domain.unionName,
    };
  }
}
