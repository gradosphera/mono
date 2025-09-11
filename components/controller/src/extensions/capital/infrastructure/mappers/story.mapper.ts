import { StoryDomainEntity } from '../../domain/entities/story.entity';
import { StoryTypeormEntity } from '../entities/story.typeorm-entity';
import type { IStoryDatabaseData } from '../../domain/interfaces/story-database.interface';

/**
 * Маппер для преобразования между доменной сущностью истории и TypeORM сущностью
 */
export class StoryMapper {
  /**
   * Преобразование TypeORM сущности в доменную сущность
   */
  static toDomain(entity: StoryTypeormEntity): StoryDomainEntity {
    const databaseData: IStoryDatabaseData = {
      _id: entity._id,
      title: entity.title,
      description: entity.description,
      status: entity.status,
      project_hash: entity.project_hash,
      issue_id: entity.issue_id,
      created_by: entity.created_by,
      sort_order: entity.sort_order,
    };

    return new StoryDomainEntity(databaseData);
  }

  /**
   * Преобразование доменной сущности в TypeORM сущность
   */
  static toEntity(domain: StoryDomainEntity): Partial<StoryTypeormEntity> {
    const entity: Partial<StoryTypeormEntity> = {
      _id: domain._id,
      title: domain.title,
      description: domain.description,
      status: domain.status,
      project_hash: domain.project_hash,
      issue_id: domain.issue_id,
      created_by: domain.created_by,
      sort_order: domain.sort_order,
    };

    return entity;
  }
}
