import { CommentDomainEntity } from '../../domain/entities/comment.entity';
import { CommentTypeormEntity } from '../entities/comment.typeorm-entity';
import type { ICommentDatabaseData } from '../../domain/interfaces/comment-database.interface';

/**
 * Маппер для преобразования между доменной сущностью комментария и TypeORM сущностью
 */
export class CommentMapper {
  /**
   * Преобразование TypeORM сущности в доменную сущность
   */
  static toDomain(entity: CommentTypeormEntity): CommentDomainEntity {
    const databaseData: ICommentDatabaseData = {
      _id: entity._id,
      content: entity.content,
      commentor_id: entity.commentor_id,
      issue_id: entity.issue_id,
      reactions: entity.reactions,
      edited_at: entity.edited_at,
    };

    return new CommentDomainEntity(databaseData);
  }

  /**
   * Преобразование доменной сущности в TypeORM сущность для создания
   */
  static toEntity(domain: Partial<CommentDomainEntity>): Partial<CommentTypeormEntity> {
    const entity: Partial<CommentTypeormEntity> = {};

    if (domain._id !== undefined) entity._id = domain._id;
    if (domain.content !== undefined) entity.content = domain.content;
    if (domain.commentor_id !== undefined) entity.commentor_id = domain.commentor_id;
    if (domain.issue_id !== undefined) entity.issue_id = domain.issue_id;
    if (domain.reactions !== undefined) entity.reactions = domain.reactions;
    if (domain.edited_at !== undefined) entity.edited_at = domain.edited_at;

    return entity;
  }
}
