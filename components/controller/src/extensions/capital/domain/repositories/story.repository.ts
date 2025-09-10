import { StoryDomainEntity } from '../entities/story.entity';
import type { StoryStatus } from '../enums/story-status.enum';

export interface StoryRepository {
  create(story: Omit<StoryDomainEntity, '_id'>): Promise<StoryDomainEntity>;
  findById(_id: string): Promise<StoryDomainEntity | null>;
  findAll(): Promise<StoryDomainEntity[]>;
  findByProjectHash(projectHash: string): Promise<StoryDomainEntity[]>; // Только проектные истории
  findAllByProjectHash(projectHash: string): Promise<StoryDomainEntity[]>; // Все истории проекта
  findProjectStories(projectHash: string): Promise<StoryDomainEntity[]>; // Только проектные истории
  findByIssueId(issueId: string): Promise<StoryDomainEntity[]>;
  findByCreatedBy(createdBy: string): Promise<StoryDomainEntity[]>;
  findByStatus(status: StoryStatus): Promise<StoryDomainEntity[]>;
  update(entity: StoryDomainEntity): Promise<StoryDomainEntity>;
  delete(_id: string): Promise<void>;
}

export const STORY_REPOSITORY = Symbol('StoryRepository');
