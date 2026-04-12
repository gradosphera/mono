export interface IssueLinkedGitCommitRow {
  id: string;
  coopname: string;
  github_owner: string;
  github_repo: string;
  github_sha: string;
  html_url: string;
  issue_hash: string;
  project_hash: string;
  username: string;
  commit_message: string;
  git_author_login: string | null;
  git_author_email: string | null;
  committed_at: Date;
  diff_text: string;
  consumed_by_commit_hash: string | null;
}

export interface IssueLinkedGitCommitRepository {
  upsertIgnoreDuplicate(row: Omit<IssueLinkedGitCommitRow, 'id' | 'consumed_by_commit_hash'>): Promise<void>;
  findUnconsumedByProjectAndUsername(projectHash: string, username: string): Promise<IssueLinkedGitCommitRow[]>;
  /** Все привязанные коммиты по задаче (аудит / UI задачи). */
  findByIssueHash(issueHash: string): Promise<IssueLinkedGitCommitRow[]>;
  /** Привязки по нескольким задачам (один запрос; группировка по `issue_hash` — на стороне вызывающего). */
  findByIssueHashes(issueHashes: string[]): Promise<IssueLinkedGitCommitRow[]>;
  markConsumed(ids: string[], commitHash: string): Promise<void>;
}

export const ISSUE_LINKED_GIT_COMMIT_REPOSITORY = Symbol('IssueLinkedGitCommitRepository');
