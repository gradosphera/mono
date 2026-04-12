import { Column, Entity, Index, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

/**
 * Связь non-merge Git-коммита с задачей и пользователем кооператива (PRD FR7, эпик 2).
 * Один SHA на кооператив — идемпотентность (FR4).
 */
export const IssueLinkedGitCommitEntityName = 'capital_issue_linked_git_commits';

@Entity(IssueLinkedGitCommitEntityName)
@Index(`idx_${IssueLinkedGitCommitEntityName}_coop_sha`, ['coopname', 'github_sha'], { unique: true })
@Index(`idx_${IssueLinkedGitCommitEntityName}_project_user_open`, [
  'coopname',
  'project_hash',
  'username',
  'consumed_by_commit_hash',
])
export class IssueLinkedGitCommitTypeormEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  coopname!: string;

  @Column({ type: 'varchar', length: 255 })
  github_owner!: string;

  @Column({ type: 'varchar', length: 255 })
  github_repo!: string;

  @Column({ type: 'varchar', length: 40 })
  github_sha!: string;

  @Column({ type: 'text' })
  html_url!: string;

  @Column({ type: 'varchar', length: 64 })
  issue_hash!: string;

  @Column({ type: 'varchar', length: 64 })
  project_hash!: string;

  @Column({ type: 'varchar', length: 255 })
  username!: string;

  @Column({ type: 'text' })
  commit_message!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  git_author_login?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  git_author_email?: string | null;

  @Column({ type: 'timestamptz' })
  committed_at!: Date;

  /** Склейка patch из GitHub API для вклада в RID / cooperative commit. */
  @Column({ type: 'text' })
  diff_text!: string;

  @Column({ type: 'varchar', length: 64, nullable: true })
  consumed_by_commit_hash!: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;
}
