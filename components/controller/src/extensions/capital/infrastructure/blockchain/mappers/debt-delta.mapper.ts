import { Injectable } from '@nestjs/common';
import type { IDelta } from '~/types/common';
import { DebtDomainEntity } from '../../../domain/entities/debt.entity';
import type { IDebtBlockchainData } from '../../../domain/interfaces/debt-blockchain.interface';
import { WinstonLoggerService } from '~/application/logger/logger-app.service';
import type { IBlockchainDeltaMapper } from '~/shared/interfaces/blockchain-sync.interface';
import { CapitalContractInfoService } from '../../services/capital-contract-info.service';
import { DomainToBlockchainUtils } from '~/shared/utils/domain-to-blockchain.utils';
import type { CapitalContract } from 'cooptypes';

/**
 * Маппер для преобразования дельт блокчейна в данные долга
 */
@Injectable()
export class DebtDeltaMapper implements IBlockchainDeltaMapper<IDebtBlockchainData, DebtDomainEntity> {
  constructor(private readonly logger: WinstonLoggerService, private readonly contractInfo: CapitalContractInfoService) {
    this.logger.setContext(DebtDeltaMapper.name);
  }

  /**
   * Маппинг дельты в данные долга из блокчейна
   */
  mapDeltaToBlockchainData(delta: IDelta): IDebtBlockchainData | null {
    try {
      if (!this.isRelevantDelta(delta)) {
        return null;
      }

      // Дельта содержит данные в поле value
      const value = delta.value as CapitalContract.Tables.Debts.IDebt;
      if (!value) {
        this.logger.warn(`Delta has no value: table=${delta.table}, key=${delta.primary_key}`);
        return null;
      }

      // Валидируем обязательные поля
      if (!this.validateBlockchainData(value)) {
        this.logger.warn(`Invalid blockchain data in delta: table=${delta.table}, key=${delta.primary_key}`);
        return null;
      }

      const statement = DomainToBlockchainUtils.convertChainDocumentToDomainFormat(value.statement);
      const approved_statement = DomainToBlockchainUtils.convertChainDocumentToDomainFormat(value.approved_statement);
      const authorization = DomainToBlockchainUtils.convertChainDocumentToDomainFormat(value.authorization);

      // Парсим документы
      return { ...value, statement, approved_statement, authorization };
    } catch (error: any) {
      this.logger.error(`Error mapping delta to blockchain data: ${error.message}`, error.stack);
      return null;
    }
  }

  /**
   * Извлечение ID сущности из дельты
   */
  extractEntityId(delta: IDelta): string {
    // В таблице debts primary_key является ID долга
    return delta.primary_key.toString();
  }

  /**
   * Проверка, относится ли дельта к долгам
   * Теперь поддерживает все версии таблиц и контрактов
   */
  isRelevantDelta(delta: IDelta): boolean {
    const isRelevantContract = this.contractInfo.isContractSupported(delta.code);
    const isRelevantTable = delta.table === 'debts' || delta.table === 'debts*' || delta.table.includes('debts');

    return isRelevantContract && isRelevantTable;
  }

  /**
   * Валидация данных блокчейна
   */
  private validateBlockchainData(data: any): boolean {
    if (!data || typeof data !== 'object') {
      return false;
    }

    // Проверяем обязательные поля
    const requiredFields = [
      'id',
      'coopname',
      'username',
      'debt_hash',
      'project_hash',
      'status',
      'amount',
      'statement',
      'approved_statement',
      'authorization',
    ];

    for (const field of requiredFields) {
      if (!(field in data)) {
        this.logger.warn(`Missing required field '${field}' in blockchain data`);
        return false;
      }
    }

    return true;
  }

  /**
   * Получение всех поддерживаемых имен таблиц
   */
  getSupportedTableNames(): string[] {
    return ['debts', 'debts*'];
  }

  /**
   * Получение всех поддерживаемых имен контрактов
   */
  getSupportedContractNames(): string[] {
    return this.contractInfo.getSupportedContractNames();
  }

  /**
   * Получение всех возможных паттернов событий для подписки
   * Возвращает массив паттернов типа "delta::contract::table"
   */
  getAllEventPatterns(): string[] {
    const patterns: string[] = [];
    const supportedContracts = this.contractInfo.getSupportedContractNames();
    const supportedTables = this.getSupportedTableNames();

    for (const contractName of supportedContracts) {
      for (const tableName of supportedTables) {
        patterns.push(`delta::${contractName}::${tableName}`);
      }
    }

    return patterns;
  }
}
