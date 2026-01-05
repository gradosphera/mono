/**
 * Интерфейс доменной сущности лога мутации
 */
export interface IMutationLogDomainInterface {
  /** ID записи */
  _id: string;

  /** Название кооператива */
  coopname?: string;

  /** Имя мутации */
  mutation_name: string;

  /** Пользователь, вызвавший мутацию */
  username: string;

  /** Аргументы мутации (санитизированные, без wif) */
  arguments: Record<string, any>;

  /** Продолжительность выполнения в миллисекундах */
  duration_ms: number;

  /** Статус выполнения */
  status: 'success' | 'error';

  /** Сообщение об ошибке (если есть) */
  error_message?: string;

  /** Дата создания */
  created_at: Date;
}

/**
 * Интерфейс для создания нового лога мутации
 */
export interface ICreateMutationLogDomainInterface {
  /** Название кооператива */
  coopname?: string;

  /** Имя мутации */
  mutation_name: string;

  /** Пользователь, вызвавший мутацию */
  username: string;

  /** Аргументы мутации (санитизированные, без wif) */
  arguments: Record<string, any>;

  /** Продолжительность выполнения в миллисекундах */
  duration_ms: number;

  /** Статус выполнения */
  status: 'success' | 'error';

  /** Сообщение об ошибке (если есть) */
  error_message?: string;
}

/**
 * Интерфейс фильтрации логов мутаций
 */
export interface IMutationLogFilterDomainInterface {
  /** Название кооператива */
  coopname?: string;

  /** Имя мутации */
  mutation_name?: string;

  /** Имена мутаций (для фильтрации по списку) */
  mutation_names?: string[];

  /** Пользователь */
  username?: string;

  /** Статус */
  status?: 'success' | 'error';

  /** Период с */
  date_from?: Date;

  /** Период по */
  date_to?: Date;
}
