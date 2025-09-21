/**
 * Доменный интерфейс для получения списка проектов вкладчика со статистикой времени
 */
export interface GetContributorProjectsTimeStatsDomainInput {
  /** Хеш вкладчика */
  contributor_hash: string;
}
