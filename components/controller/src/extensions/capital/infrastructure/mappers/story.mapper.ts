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
   * Преобразование доменной сущности в TypeORM сущность для создания
   */
  static toEntity(domain: Partial<StoryDomainEntity>): Partial<StoryTypeormEntity> {
    const entity: Partial<StoryTypeormEntity> = {};

    if (domain._id !== undefined) entity._id = domain._id;
    if (domain.title !== undefined) entity.title = domain.title;
    if (domain.description !== undefined) entity.description = domain.description;
    if (domain.status !== undefined) entity.status = domain.status;
    if (domain.project_hash !== undefined) entity.project_hash = domain.project_hash;
    if (domain.issue_id !== undefined) entity.issue_id = domain.issue_id;
    if (domain.created_by !== undefined) entity.created_by = domain.created_by;
    if (domain.sort_order !== undefined) entity.sort_order = domain.sort_order;

    return entity;
  }
}
