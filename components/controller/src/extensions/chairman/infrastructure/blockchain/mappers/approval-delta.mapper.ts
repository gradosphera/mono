import { Injectable } from '@nestjs/common';
import type { IDelta } from '~/types/common';
import { ApprovalDomainEntity } from '../../../domain/entities/approval.entity';
import type { IApprovalBlockchainData } from '../../../domain/interfaces/approval-blockchain.interface';
import { WinstonLoggerService } from '~/application/logger/logger-app.service';
import type { IBlockchainDeltaMapper } from '~/shared/interfaces/blockchain-sync.interface';
import { DomainToBlockchainUtils } from '~/shared/utils/domain-to-blockchain.utils';
import type { SovietContract } from 'cooptypes';

/**
 * Маппер для преобразования дельт блокчейна в данные одобрения
 */
@Injectable()
export class ApprovalDeltaMapper implements IBlockchainDeltaMapper<IApprovalBlockchainData, ApprovalDomainEntity> {
  constructor(private readonly logger: WinstonLoggerService) {
    this.logger.setContext(ApprovalDeltaMapper.name);
  }

  mapDeltaToBlockchainData(delta: IDelta): IApprovalBlockchainData | null {
    try {
      if (!this.isRelevantDelta(delta)) {
        return null;
      }

      // Дельта содержит данные в поле value
      const value = delta.value as SovietContract.Tables.Approvals.IApproval;
      if (!value) {
        this.logger.warn(`Delta has no value: table=${delta.table}, key=${delta.primary_key}`);
        return null;
      }

      // Валидируем обязательные поля
      if (!this.validateBlockchainData(value)) {
        this.logger.warn(`Invalid blockchain data in delta: table=${delta.table}, key=${delta.primary_key}`);
        return null;
      }

      // 🔥 ВАЖНО: Парсим документ ПЕРЕД возвратом
      const document = DomainToBlockchainUtils.convertChainDocumentToDomainFormat(value.document);

      // Парсим документ
      return { ...value, document };
    } catch (error: any) {
      this.logger.error(`Error mapping delta to blockchain data: ${error.message}`, error.stack);
      return null;
    }
  }

  extractSyncValue(delta: IDelta): string {
    if (!delta.value || !delta.value[this.extractSyncKey()]) {
      throw new Error(`Delta has no value: table=${delta.table}, key=${this.extractSyncKey()}`);
    }

    return delta.value[this.extractSyncKey()];
  }

  extractSyncKey(): string {
    // Возвращаем ключ синхронизации из доменной сущности
    return ApprovalDomainEntity.getSyncKey();
  }

  isRelevantDelta(delta: IDelta): boolean {
    // Проверяем, что это таблица approvals
    const isRelevantTable = delta.table === 'approvals' || delta.table === 'approvals*' || delta.table.includes('approvals');

    return isRelevantTable;
  }

  private validateBlockchainData(data: any): boolean {
    if (!data || typeof data !== 'object') {
      return false;
    }

    // Проверяем обязательные поля
    const requiredFields = [
      'id',
      'coopname',
      'username',
      'document',
      'approval_hash',
      'callback_contract',
      'callback_action_approve',
      'callback_action_decline',
      'meta',
      'created_at',
    ];

    for (const field of requiredFields) {
      if (!(field in data)) {
        this.logger.warn(`Missing required field '${field}' in blockchain data`);
        return false;
      }
    }

    return true;
  }

  getSupportedTableNames(): string[] {
    return ['approvals', 'approvals*'];
  }

  getSupportedContractNames(): string[] {
    return ['soviet']; // Контракт soviet содержит таблицу approvals
  }

  getAllEventPatterns(): string[] {
    const patterns: string[] = [];
    const supportedContracts = this.getSupportedContractNames();
    const supportedTables = this.getSupportedTableNames();

    for (const contractName of supportedContracts) {
      for (const tableName of supportedTables) {
        patterns.push(`delta::${contractName}::${tableName}`);
      }
    }

    return patterns;
  }
}
