import { ProgramWalletDomainEntity } from '../../domain/entities/program-wallet.entity';
import { ProgramWalletTypeormEntity } from '../entities/program-wallet.typeorm-entity';
import type { IProgramWalletDatabaseData } from '../../domain/interfaces/program-wallet-database.interface';
import type { IProgramWalletBlockchainData } from '../../domain/interfaces/program-wallet-blockchain.interface';

/**
 * Маппер для преобразования между доменной сущностью программного кошелька и TypeORM сущностью
 */
export class ProgramWalletMapper {
  /**
   * Преобразование TypeORM сущности в доменную сущность
   */
  static toDomain(entity: ProgramWalletTypeormEntity): ProgramWalletDomainEntity {
    const databaseData: IProgramWalletDatabaseData = {
      id: entity.id,
      blockchain_id: entity.blockchain_id || '',
      block_num: entity.block_num || null,
      present: entity.present,
    };

    // Используем данные из TypeORM сущности
    const blockchainData: IProgramWalletBlockchainData = {
      id: entity.blockchain_id || '',
      coopname: entity.coopname,
      username: entity.username,
      last_program_crps: entity.last_program_crps,
      capital_available: entity.capital_available,
    };

    return new ProgramWalletDomainEntity(databaseData, blockchainData);
  }

  /**
   * Преобразование доменной сущности в TypeORM сущность для создания
   */
  static toEntity(domain: Partial<ProgramWalletDomainEntity>): Partial<ProgramWalletTypeormEntity> {
    const entity: Partial<ProgramWalletTypeormEntity> = {
      blockchain_id: domain.blockchain_id || '',
      block_num: domain.block_num || undefined,
      present: domain.present,
    };

    // Поля из блокчейна
    if (domain.coopname !== undefined) entity.coopname = domain.coopname;
    if (domain.username !== undefined) entity.username = domain.username;
    if (domain.last_program_crps !== undefined) entity.last_program_crps = domain.last_program_crps;
    if (domain.capital_available !== undefined) entity.capital_available = domain.capital_available;

    return entity;
  }
}
