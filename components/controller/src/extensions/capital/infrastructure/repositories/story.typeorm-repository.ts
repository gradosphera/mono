import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StoryRepository } from '../../domain/repositories/story.repository';
import { StoryDomainEntity } from '../../domain/entities/story.entity';
import { StoryTypeormEntity } from '../entities/story.typeorm-entity';
import { StoryMapper } from '../mappers/story.mapper';
import { CAPITAL_DATABASE_CONNECTION } from '../database/capital-database.module';
import type { StoryStatus } from '../../domain/enums/story-status.enum';

@Injectable()
export class StoryTypeormRepository implements StoryRepository {
  constructor(
    @InjectRepository(StoryTypeormEntity, CAPITAL_DATABASE_CONNECTION)
    private readonly storyTypeormRepository: Repository<StoryTypeormEntity>
  ) {}

  async create(story: Omit<StoryDomainEntity, '_id'>): Promise<StoryDomainEntity> {
    const entity = this.storyTypeormRepository.create(StoryMapper.toEntity(story));
    const savedEntity = await this.storyTypeormRepository.save(entity);
    return StoryMapper.toDomain(savedEntity);
  }

  async findById(_id: string): Promise<StoryDomainEntity | null> {
    const entity = await this.storyTypeormRepository.findOne({ where: { _id } });
    return entity ? StoryMapper.toDomain(entity) : null;
  }

  async findAll(): Promise<StoryDomainEntity[]> {
    const entities = await this.storyTypeormRepository.find();
    return entities.map(StoryMapper.toDomain);
  }

  async findByProjectHash(projectHash: string): Promise<StoryDomainEntity[]> {
    // Ищем только проектные истории (без привязки к задачам)
    const entities = await this.storyTypeormRepository.find({
      where: {
        project_hash: projectHash,
        issue_id: null as any, // Только проектные истории
      },
      order: { sort_order: 'ASC' },
    });
    return entities.map(StoryMapper.toDomain);
  }

  /**
   * Найти все истории проекта (проектные + истории всех задач проекта)
   */
  async findAllByProjectHash(projectHash: string): Promise<StoryDomainEntity[]> {
    // Используем query builder для более сложного запроса
    const entities = await this.storyTypeormRepository
      .createQueryBuilder('story')
      .leftJoin('story.issue', 'issue')
      .where('story.project_hash = :projectHash', { projectHash })
      .andWhere('(story.issue_id IS NULL OR issue.project_hash = :projectHash)', { projectHash })
      .orderBy('story.sort_order', 'ASC')
      .getMany();

    return entities.map(StoryMapper.toDomain);
  }

  /**
   * Найти только проектные истории (не привязанные к задачам)
   */
  async findProjectStories(projectHash: string): Promise<StoryDomainEntity[]> {
    const entities = await this.storyTypeormRepository.find({
      where: {
        project_hash: projectHash,
        issue_id: null as any,
      },
      order: { sort_order: 'ASC' },
    });
    return entities.map(StoryMapper.toDomain);
  }

  async findByIssueId(issueId: string): Promise<StoryDomainEntity[]> {
    const entities = await this.storyTypeormRepository.find({
      where: { issue_id: issueId },
      order: { sort_order: 'ASC' },
    });
    return entities.map(StoryMapper.toDomain);
  }

  async findByCreatedBy(createdBy: string): Promise<StoryDomainEntity[]> {
    const entities = await this.storyTypeormRepository.find({
      where: { created_by: createdBy },
      order: { created_at: 'DESC' },
    });
    return entities.map(StoryMapper.toDomain);
  }

  async findByStatus(status: StoryStatus): Promise<StoryDomainEntity[]> {
    const entities = await this.storyTypeormRepository.find({
      where: { status },
      order: { sort_order: 'ASC' },
    });
    return entities.map(StoryMapper.toDomain);
  }

  async update(entity: StoryDomainEntity): Promise<StoryDomainEntity> {
    const typeormEntity = StoryMapper.toEntity(entity);
    await this.storyTypeormRepository.update(entity._id, typeormEntity);
    const updatedEntity = await this.storyTypeormRepository.findOne({
      where: { _id: entity._id },
    });
    return updatedEntity ? StoryMapper.toDomain(updatedEntity) : entity;
  }

  async delete(_id: string): Promise<void> {
    await this.storyTypeormRepository.delete(_id);
  }
}
