import type { ProjectTimeStatsDomainInterface } from './project-time-stats-domain.interface';

/**
 * Доменный интерфейс для списка проектов вкладчика со статистикой времени
 */
export interface ContributorProjectsTimeStatsDomainInterface {
  /** Хеш вкладчика */
  contributor_hash: string;

  /** Список проектов с статистикой времени */
  projects: ProjectTimeStatsDomainInterface[];
}
