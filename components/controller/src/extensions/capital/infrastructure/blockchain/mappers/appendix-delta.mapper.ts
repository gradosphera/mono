import { Injectable } from '@nestjs/common';
import type { IDelta } from '~/types/common';
import { AppendixDomainEntity } from '../../../domain/entities/appendix.entity';
import type { IAppendixBlockchainData } from '../../../domain/interfaces/appendix-blockchain.interface';
import { WinstonLoggerService } from '~/application/logger/logger-app.service';
import type { IBlockchainDeltaMapper } from '~/shared/interfaces/blockchain-sync.interface';
import { CapitalContractInfoService } from '../../services/capital-contract-info.service';
import { DomainToBlockchainUtils } from '~/shared/utils/domain-to-blockchain.utils';
import type { CapitalContract } from 'cooptypes';

/**
 * Маппер для преобразования дельт блокчейна в данные приложения
 */
@Injectable()
export class AppendixDeltaMapper implements IBlockchainDeltaMapper<IAppendixBlockchainData, AppendixDomainEntity> {
  constructor(private readonly logger: WinstonLoggerService, private readonly contractInfo: CapitalContractInfoService) {
    this.logger.setContext(AppendixDeltaMapper.name);
  }

  mapDeltaToBlockchainData(delta: IDelta): IAppendixBlockchainData | null {
    try {
      if (!this.isRelevantDelta(delta)) {
        return null;
      }

      // Дельта содержит данные в поле value
      const value = delta.value as CapitalContract.Tables.Appendixes.IAppendix;
      if (!value) {
        this.logger.warn(`Delta has no value: table=${delta.table}, key=${delta.primary_key}`);
        return null;
      }

      // Валидируем обязательные поля
      if (!this.validateBlockchainData(value)) {
        this.logger.warn(`Invalid blockchain data in delta: table=${delta.table}, key=${delta.primary_key}`);
        return null;
      }

      // 🔥 ВАЖНО: Парсим документы ПЕРЕД возвратом
      const appendix = DomainToBlockchainUtils.convertChainDocumentToDomainFormat(value.appendix);

      // Парсим документы
      return { ...value, appendix };
    } catch (error: any) {
      this.logger.error(`Error mapping delta to blockchain data: ${error.message}`, error.stack);
      return null;
    }
  }

  extractEntityId(delta: IDelta): string {
    // В таблице appendixes primary_key является ID приложения
    return delta.primary_key.toString();
  }

  isRelevantDelta(delta: IDelta): boolean {
    const isRelevantContract = this.contractInfo.isContractSupported(delta.code);
    const isRelevantTable =
      delta.table === 'appendixes' || delta.table === 'appendixes*' || delta.table.includes('appendixes');

    return isRelevantContract && isRelevantTable;
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
      'project_hash',
      'appendix_hash',
      'status',
      'created_at',
      'appendix',
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
    return ['appendixes', 'appendixes*'];
  }

  getSupportedContractNames(): string[] {
    return this.contractInfo.getSupportedContractNames();
  }

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
