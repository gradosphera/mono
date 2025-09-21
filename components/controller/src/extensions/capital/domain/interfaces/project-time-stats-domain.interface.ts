/**
 * Доменный интерфейс для статистики времени по проекту вкладчика
 */
export interface ProjectTimeStatsDomainInterface {
  /** Хеш проекта */
  project_hash: string;

  /** Название проекта */
  project_name: string;

  /** Хеш вкладчика */
  contributor_hash: string;

  /** Сумма закоммиченного времени (часы) */
  total_committed_hours: number;

  /** Сумма незакоммиченного времени (часы) */
  total_uncommitted_hours: number;

  /** Доступное время для коммита (часы, ограничено 8 часами) */
  available_hours: number;
}
