/**
 * Порт для сервиса синхронизации состояния парсера
 */
export interface SyncStateRepositoryPort {
  /**
   * Получение текущего блока синхронизации
   */
  getCurrentBlock(): Promise<number>;

  /**
   * Обновление текущего блока синхронизации
   */
  updateCurrentBlock(blockNum: number): Promise<void>;
}

// Экспорт символа для внедрения зависимостей
export const SYNC_STATE_REPOSITORY_PORT = Symbol('SyncStateRepositoryPort');
