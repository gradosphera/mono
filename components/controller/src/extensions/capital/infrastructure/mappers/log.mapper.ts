import { LogDomainEntity } from '../../domain/entities/log.entity';
import { LogTypeormEntity } from '../entities/log.typeorm-entity';
import type { ILogDomainInterface } from '../../domain/interfaces/log-domain.interface';

/**
 * Маппер для преобразования между доменной сущностью лога и TypeORM сущностью
 */
export class LogMapper {
  /**
   * Преобразование TypeORM сущности в доменную сущность
   */
  static toDomain(entity: LogTypeormEntity): LogDomainEntity {
    const domainData: ILogDomainInterface = {
      _id: entity._id,
      coopname: entity.coopname,
      project_hash: entity.project_hash,
      event_type: entity.event_type,
      initiator: entity.initiator,
      reference_id: entity.reference_id,
      metadata: entity.metadata,
      message: entity.message,
      created_at: entity.created_at,
    };

    return new LogDomainEntity(domainData);
  }

  /**
   * Преобразование доменной сущности в TypeORM сущность
   */
  static toEntity(domain: Partial<LogDomainEntity>): Partial<LogTypeormEntity> {
    const entity: Partial<LogTypeormEntity> = {};

    if (domain._id !== undefined) entity._id = domain._id;
    if (domain.coopname !== undefined) entity.coopname = domain.coopname;
    if (domain.project_hash !== undefined) entity.project_hash = domain.project_hash.toLowerCase();
    if (domain.event_type !== undefined) entity.event_type = domain.event_type;
    if (domain.initiator !== undefined) entity.initiator = domain.initiator;
    if (domain.reference_id !== undefined) entity.reference_id = domain.reference_id;
    if (domain.metadata !== undefined) entity.metadata = domain.metadata;
    if (domain.message !== undefined) entity.message = domain.message;
    if (domain.created_at !== undefined) entity.created_at = domain.created_at;

    return entity;
  }
}
