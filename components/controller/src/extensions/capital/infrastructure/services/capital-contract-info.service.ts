import { Injectable } from '@nestjs/common';

/**
 * Сервис предоставляющий информацию о поддерживаемых контрактах и таблицах для Capital модуля
 *
 * Централизует информацию о версиях контрактов и таблицах для повторного использования
 */
@Injectable()
export class CapitalContractInfoService {
  /**
   * Поддерживаемые версии контрактов Capital
   * При добавлении новой версии контракта - добавьте её сюда
   */
  private readonly supportedContractNames: string[] = ['capital'];

  /**
   * Поддерживаемые таблицы для Capital модуля
   * При добавлении новой таблицы - добавьте её сюда
   */
  private readonly supportedTableNames: string[] = ['projects', 'contributors'];

  /**
   * Получение всех поддерживаемых имен контрактов
   */
  getSupportedContractNames(): string[] {
    return [...this.supportedContractNames];
  }

  /**
   * Получение всех поддерживаемых имен таблиц
   */
  getSupportedTableNames(): string[] {
    return [...this.supportedTableNames];
  }

  /**
   * Получение текущего (основного) имени контракта
   */
  getCurrentContractName(): string {
    return this.supportedContractNames[0];
  }

  /**
   * Получение текущего (основного) имени таблицы
   */
  getCurrentTableName(): string {
    return this.supportedTableNames[0];
  }

  /**
   * Проверка, поддерживается ли указанный контракт
   */
  isContractSupported(contractName: string): boolean {
    return this.supportedContractNames.includes(contractName);
  }

  /**
   * Проверка, поддерживается ли указанная таблица
   */
  isTableSupported(tableName: string): boolean {
    return this.supportedTableNames.includes(tableName);
  }
}
