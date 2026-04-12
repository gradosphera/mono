import { Column, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

/** Курсор tip ветки для инкрементального сравнения коммитов (PRD NFR1, story 1.2). */
export const GithubBranchCommitSyncStateEntityName = 'capital_github_branch_commit_sync_state';

@Entity(GithubBranchCommitSyncStateEntityName)
@Index(`idx_${GithubBranchCommitSyncStateEntityName}_repo_branch`, ['coopname', 'github_repository', 'branch'], {
  unique: true,
})
export class GithubBranchCommitSyncStateTypeormEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  coopname!: string;

  /** Нормализованный URL репозитория (или legacy owner/repo) — ключ курсора NFR1. */
  @Column({ type: 'varchar', length: 512 })
  github_repository!: string;

  @Column({ type: 'varchar', length: 255 })
  branch!: string;

  /** Последний обработанный tip ветки (для compare base); null — «холодный старт», берём текущий HEAD без backfill. */
  @Column({ type: 'varchar', length: 40, nullable: true })
  last_synced_tip_sha!: string | null;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;
}
