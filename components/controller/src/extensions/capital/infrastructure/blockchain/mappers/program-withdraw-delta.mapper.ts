import { Injectable } from '@nestjs/common';
import type { IDelta } from '~/types/common';
import { ProgramWithdrawDomainEntity } from '../../../domain/entities/program-withdraw.entity';
import type { IProgramWithdrawBlockchainData } from '../../../domain/interfaces/program-withdraw-blockchain.interface';
import { WinstonLoggerService } from '~/application/logger/logger-app.service';
import type { IBlockchainDeltaMapper } from '~/shared/interfaces/blockchain-sync.interface';
import { CapitalContractInfoService } from '../../services/capital-contract-info.service';
import { DomainToBlockchainUtils } from '~/shared/utils/domain-to-blockchain.utils';
import type { CapitalContract } from 'cooptypes';

/**
 * Маппер для преобразования дельт блокчейна в данные возврата из программы
 */
@Injectable()
export class ProgramWithdrawDeltaMapper
  implements IBlockchainDeltaMapper<IProgramWithdrawBlockchainData, ProgramWithdrawDomainEntity>
{
  constructor(private readonly logger: WinstonLoggerService, private readonly contractInfo: CapitalContractInfoService) {
    this.logger.setContext(ProgramWithdrawDeltaMapper.name);
  }

  mapDeltaToBlockchainData(delta: IDelta): IProgramWithdrawBlockchainData | null {
    try {
      if (!this.isRelevantDelta(delta)) {
        return null;
      }

      // Дельта содержит данные в поле value
      const value = delta.value as CapitalContract.Tables.ProgramWithdraws.IProgramWithdraw;
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
      const statement = DomainToBlockchainUtils.convertChainDocumentToDomainFormat(value.statement);

      // Парсим документы
      return { ...value, statement };
    } catch (error: any) {
      this.logger.error(`Error mapping delta to blockchain data: ${error.message}`, error.stack);
      return null;
    }
  }

  extractEntityId(delta: IDelta): string {
    // В таблице prgwithdraws primary_key является ID возврата из программы
    return delta.primary_key.toString();
  }

  isRelevantDelta(delta: IDelta): boolean {
    const isRelevantContract = this.contractInfo.isContractSupported(delta.code);
    const isRelevantTable =
      delta.table === 'prgwithdraws' || delta.table === 'prgwithdraws*' || delta.table.includes('prgwithdraws');

    return isRelevantContract && isRelevantTable;
  }

  private validateBlockchainData(data: any): boolean {
    if (!data || typeof data !== 'object') {
      return false;
    }

    // Проверяем обязательные поля
    const requiredFields = ['id', 'coopname', 'withdraw_hash', 'username', 'status', 'amount', 'statement', 'created_at'];

    for (const field of requiredFields) {
      if (!(field in data)) {
        this.logger.warn(`Missing required field '${field}' in blockchain data`);
        return false;
      }
    }

    return true;
  }

  getSupportedTableNames(): string[] {
    return ['prgwithdraws', 'prgwithdraws*'];
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
