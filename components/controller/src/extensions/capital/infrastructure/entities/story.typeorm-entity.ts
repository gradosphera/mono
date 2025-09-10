import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { StoryStatus } from '../../domain/enums/story-status.enum';
import { ProjectTypeormEntity } from './project.typeorm-entity';
import { IssueTypeormEntity } from './issue.typeorm-entity';

const EntityName = 'capital_stories';
@Entity(EntityName)
@Index(`idx_${EntityName}_project_hash`, ['project_hash'])
@Index(`idx_${EntityName}_issue_id`, ['issue_id'])
@Index(`idx_${EntityName}_created_by`, ['created_by'])
@Index(`idx_${EntityName}_status`, ['status'])
export class StoryTypeormEntity {
  @PrimaryGeneratedColumn('uuid')
  _id!: string;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: StoryStatus,
    default: StoryStatus.PENDING,
  })
  status!: StoryStatus;

  @Column({ type: 'varchar', nullable: true })
  project_hash?: string;

  @Column({ type: 'varchar', nullable: true })
  issue_id?: string;

  @Column({ type: 'varchar' })
  created_by!: string;

  @Column({ type: 'integer', default: 0 })
  sort_order!: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;

  // Связи
  @ManyToOne(() => ProjectTypeormEntity, (project) => project.stories, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_hash', referencedColumnName: 'project_hash' })
  project!: ProjectTypeormEntity;

  @ManyToOne(() => IssueTypeormEntity, (issue) => issue.stories, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'issue_id' })
  issue!: IssueTypeormEntity;
}
