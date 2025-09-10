import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { IssuePriority } from '../../domain/enums/issue-priority.enum';
import { IssueStatus } from '../../domain/enums/issue-status.enum';
import { ProjectTypeormEntity } from './project.typeorm-entity';
import { CycleTypeormEntity } from './cycle.typeorm-entity';
import { CommentTypeormEntity } from './comment.typeorm-entity';
import { StoryTypeormEntity } from './story.typeorm-entity';

const EntityName = 'capital_issues';
@Entity(EntityName)
@Index(`idx_${EntityName}_project_hash`, ['project_hash'])
@Index(`idx_${EntityName}_created_by`, ['created_by'])
@Index(`idx_${EntityName}_submaster_id`, ['submaster_id'])
@Index(`idx_${EntityName}_cycle_id`, ['cycle_id'])
@Index(`idx_${EntityName}_status`, ['status'])
@Index(`idx_${EntityName}_priority`, ['priority'])
export class IssueTypeormEntity {
  @PrimaryGeneratedColumn('uuid')
  _id!: string;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: IssuePriority,
    default: IssuePriority.MEDIUM,
  })
  priority!: IssuePriority;

  @Column({
    type: 'enum',
    enum: IssueStatus,
    default: IssueStatus.BACKLOG,
  })
  status!: IssueStatus;

  @Column({ type: 'integer', default: 0 })
  estimate!: number;

  @Column({ type: 'integer', default: 0 })
  sort_order!: number;

  @Column({ type: 'varchar', length: 36 })
  created_by!: string;

  @Column({ type: 'json', default: [] })
  creators_ids!: string[];

  @Column({ type: 'varchar', length: 36, nullable: true })
  submaster_id?: string;

  @Column({ type: 'varchar' })
  project_hash!: string;

  @Column({ type: 'varchar', nullable: true })
  cycle_id?: string;

  @Column({ type: 'json', default: {} })
  metadata!: {
    labels: string[];
    attachments: string[];
  };

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;

  // Связи
  @ManyToOne(() => ProjectTypeormEntity, (project) => project.issues, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_hash', referencedColumnName: 'project_hash' })
  project!: ProjectTypeormEntity;

  @ManyToOne(() => CycleTypeormEntity, (cycle) => cycle.issues, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'cycle_id' })
  cycle!: CycleTypeormEntity;

  @OneToMany(() => CommentTypeormEntity, (comment) => comment.issue, { cascade: true })
  comments!: CommentTypeormEntity[];

  @OneToMany(() => StoryTypeormEntity, (story) => story.issue, { cascade: true })
  stories!: StoryTypeormEntity[];
}
