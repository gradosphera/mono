/**
 * Доменный интерфейс для конфигурации подписки на дельты
 */
export interface DeltaConfigDomainInterface {
  code: string;
  table: string;
  scope?: string;
  notify?: boolean;
}

/**
 * Доменный интерфейс для конфигурации подписки на действия
 */
export interface ActionConfigDomainInterface {
  code: string;
  action: string;
  notify?: boolean;
}

/**
 * Интерфейс для фильтрации действий
 */
export interface ActionFilterDomainInterface {
  account?: string;
  name?: string;
  block_num?: number;
  global_sequence?: string;
}

/**
 * Интерфейс для фильтрации дельт
 */
export interface DeltaFilterDomainInterface {
  code?: string;
  scope?: string;
  table?: string;
  block_num?: number;
  primary_key?: string;
  present?: boolean;
}

/**
 * Интерфейс для результата с пагинацией
 */
export interface PaginatedResultDomainInterface<T> {
  results: T[];
  page: number;
  limit: number;
  total: number;
}
