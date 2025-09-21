/**
 * Доменный интерфейс для статистики времени вкладчика по проекту
 */
export interface TimeStatsDomainInterface {
  /** Хеш вкладчика */
  contributor_hash: string;

  /** Хеш проекта */
  project_hash: string;

  /** Сумма закоммиченного времени (часы) */
  total_committed_hours: number;

  /** Сумма незакоммиченного времени (часы) */
  total_uncommitted_hours: number;

  /** Доступное время для коммита (часы, ограничено 8 часами) */
  available_hours: number;
}
