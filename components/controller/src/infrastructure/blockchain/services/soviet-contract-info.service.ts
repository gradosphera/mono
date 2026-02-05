import { Injectable } from '@nestjs/common';

/**
 * Сервис предоставляющий информацию о поддерживаемых контрактах и таблицах для Soviet модуля
 *
 * Централизует информацию о версиях контрактов и таблицах для повторного использования
 */
@Injectable()
export class SovietContractInfoService {
  /**
   * Поддерживаемые версии контрактов Soviet
   * При добавлении новой версии контракта - добавьте её сюда
   */
  private readonly supportedContractNames: string[] = ['soviet'];

  /**
   * Паттерны таблиц для каждой сущности
   * Каждая сущность имеет базовое имя таблицы и паттерн с маской
   */
  private readonly tablePatterns: Record<string, string[]> = {
    // Таблицы soviet контракта
    agreements3: ['agreements3', 'agreements*'],
    progwallets: ['progwallets', 'progwallets*'],
    // Добавьте другие таблицы по мере необходимости
  };

  /**
   * Получение всех поддерживаемых имен контрактов
   */
  getSupportedContractNames(): string[] {
    return [...this.supportedContractNames];
  }

  /**
   * Получение паттернов таблиц для указанной сущности
   * @param entityName - имя сущности
   */
  getTablePatterns(entityName: string): string[] {
    const patterns = this.tablePatterns[entityName];
    if (!patterns) {
      throw new Error(
        `Unknown entity name: ${entityName}. Supported entities: ${Object.keys(this.tablePatterns).join(', ')}`
      );
    }
    return [...patterns];
  }

  /**
   * Проверка, поддерживается ли указанный контракт
   */
  isContractSupported(contractName: string): boolean {
    return this.supportedContractNames.includes(contractName);
  }
}
