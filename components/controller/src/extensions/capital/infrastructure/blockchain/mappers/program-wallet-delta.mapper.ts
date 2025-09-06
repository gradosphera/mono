import { Injectable } from '@nestjs/common';
import type { IDelta } from '~/types/common';
import { ProgramWalletDomainEntity } from '../../../domain/entities/program-wallet.entity';
import type { IProgramWalletBlockchainData } from '../../../domain/interfaces/program-wallet-blockchain.interface';
import { WinstonLoggerService } from '~/application/logger/logger-app.service';
import type { IBlockchainDeltaMapper } from '~/shared/interfaces/blockchain-sync.interface';
import { CapitalContractInfoService } from '../../services/capital-contract-info.service';
import type { CapitalContract } from 'cooptypes';

/**
 * Маппер для преобразования дельт блокчейна в данные программного кошелька
 */
@Injectable()
export class ProgramWalletDeltaMapper
  implements IBlockchainDeltaMapper<IProgramWalletBlockchainData, ProgramWalletDomainEntity>
{
  constructor(private readonly logger: WinstonLoggerService, private readonly contractInfo: CapitalContractInfoService) {
    this.logger.setContext(ProgramWalletDeltaMapper.name);
  }

  mapDeltaToBlockchainData(delta: IDelta): IProgramWalletBlockchainData | null {
    try {
      if (!this.isRelevantDelta(delta)) {
        return null;
      }

      // Дельта содержит данные в поле value
      const value = delta.value as CapitalContract.Tables.ProgramWallets.ICapitalWallet;
      if (!value) {
        this.logger.warn(`Delta has no value: table=${delta.table}, key=${delta.primary_key}`);
        return null;
      }

      // Валидируем обязательные поля
      if (!this.validateBlockchainData(value)) {
        this.logger.warn(`Invalid blockchain data in delta: table=${delta.table}, key=${delta.primary_key}`);
        return null;
      }

      // Для ProgramWallets нет документов для парсинга
      return value;
    } catch (error: any) {
      this.logger.error(`Error mapping delta to blockchain data: ${error.message}`, error.stack);
      return null;
    }
  }

  extractEntityId(delta: IDelta): string {
    // В таблице capwallets primary_key является ID программного кошелька
    return delta.primary_key.toString();
  }

  isRelevantDelta(delta: IDelta): boolean {
    const isRelevantContract = this.contractInfo.isContractSupported(delta.code);
    const isRelevantTable =
      delta.table === 'capwallets' || delta.table === 'capwallets*' || delta.table.includes('capwallets');

    return isRelevantContract && isRelevantTable;
  }

  private validateBlockchainData(data: any): boolean {
    if (!data || typeof data !== 'object') {
      return false;
    }

    // Проверяем обязательные поля
    const requiredFields = ['id', 'coopname', 'username', 'last_program_crps', 'capital_available'];

    for (const field of requiredFields) {
      if (!(field in data)) {
        this.logger.warn(`Missing required field '${field}' in blockchain data`);
        return false;
      }
    }

    return true;
  }

  getSupportedTableNames(): string[] {
    return ['capwallets', 'capwallets*'];
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
