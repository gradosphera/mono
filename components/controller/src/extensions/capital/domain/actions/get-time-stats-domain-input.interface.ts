/**
 * Доменный интерфейс для получения статистики времени вкладчика по проекту
 */
export interface GetTimeStatsDomainInput {
  /** Хеш вкладчика */
  contributor_hash: string;

  /** Хеш проекта */
  project_hash: string;
}
