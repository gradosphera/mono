import { Entity, Column, Index, ManyToOne, OneToMany, JoinColumn, ManyToMany, JoinTable } from 'typeorm';
import { IssuePriority } from '../../domain/enums/issue-priority.enum';
import { IssueStatus } from '../../domain/enums/issue-status.enum';
import { ProjectTypeormEntity } from './project.typeorm-entity';
import { CycleTypeormEntity } from './cycle.typeorm-entity';
import { CommentTypeormEntity } from './comment.typeorm-entity';
import { StoryTypeormEntity } from './story.typeorm-entity';
import { ContributorTypeormEntity } from './contributor.typeorm-entity';
import { BaseTypeormEntity } from './base.typeorm-entity';

const EntityName = 'capital_issues';
@Entity(EntityName)
@Index(`idx_${EntityName}_project_hash`, ['project_hash'])
@Index(`idx_${EntityName}_issue_hash`, ['issue_hash'])
@Index(`idx_${EntityName}_created_by`, ['created_by'])
@Index(`idx_${EntityName}_submaster_hash`, ['submaster_hash'])
@Index(`idx_${EntityName}_cycle_id`, ['cycle_id'])
@Index(`idx_${EntityName}_status`, ['status'])
@Index(`idx_${EntityName}_priority`, ['priority'])
@Index(`idx_${EntityName}_created_at`, ['_created_at'])
export class IssueTypeormEntity extends BaseTypeormEntity {
  @Column({ type: 'varchar', length: 64 })
  issue_hash!: string;

  @Column({ type: 'varchar', length: 255 })
  coopname!: string;

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

  @Column({ type: 'text', array: true, default: [] })
  creators_hashs!: string[];

  @Column({ type: 'varchar', length: 64, nullable: true })
  submaster_hash?: string;

  @Column({ type: 'varchar' })
  project_hash!: string;

  @Column({ type: 'varchar', nullable: true })
  cycle_id?: string;

  @Column({ type: 'json', default: {} })
  metadata!: {
    labels: string[];
    attachments: string[];
  };

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

  // Связи с contributors
  @ManyToMany(() => ContributorTypeormEntity, (contributor) => contributor.issues, { cascade: false })
  @JoinTable({
    name: 'capital_issue_creators',
    joinColumn: {
      name: 'issue_id',
      referencedColumnName: '_id',
    },
    inverseJoinColumn: {
      name: 'contributor_hash',
      referencedColumnName: 'contributor_hash',
    },
  })
  creators!: ContributorTypeormEntity[];

  @ManyToOne(() => ContributorTypeormEntity, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'submaster_hash', referencedColumnName: 'contributor_hash' })
  submaster!: ContributorTypeormEntity;
}
