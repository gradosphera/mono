import { StateDomainEntity } from '../../domain/entities/state.entity';
import { StateTypeormEntity } from '../entities/state.typeorm-entity';
import type { IStateDatabaseData } from '../../domain/interfaces/state-database.interface';
import type { IStateBlockchainData } from '../../domain/interfaces/state-blockchain.interface';

/**
 * Маппер для преобразования между доменной сущностью состояния и TypeORM сущностью
 */
export class StateMapper {
  /**
   * Преобразование TypeORM сущности в доменную сущность
   */
  static toDomain(entity: StateTypeormEntity): StateDomainEntity {
    const databaseData: IStateDatabaseData = {
      id: entity.id,
      blockchain_id: entity.blockchain_id || '',
      block_num: entity.block_num || null,
      present: entity.present,
    };

    // Используем данные из TypeORM сущности
    const blockchainData: IStateBlockchainData = {
      coopname: entity.coopname,
      global_available_invest_pool: entity.global_available_invest_pool,
      program_membership_funded: entity.program_membership_funded,
      program_membership_available: entity.program_membership_available,
      program_membership_distributed: entity.program_membership_distributed,
      program_membership_cumulative_reward_per_share: entity.program_membership_cumulative_reward_per_share,
      config: entity.config,
    };

    return new StateDomainEntity(databaseData, blockchainData);
  }

  /**
   * Преобразование доменной сущности в TypeORM сущность для создания
   */
  static toEntity(domain: Partial<StateDomainEntity>): Partial<StateTypeormEntity> {
    const entity: Partial<StateTypeormEntity> = {
      blockchain_id: domain.blockchain_id ? domain.blockchain_id : '',
      block_num: domain.block_num || undefined,
      present: domain.present,
    };

    // Поля из блокчейна
    if (domain.coopname !== undefined) entity.coopname = domain.coopname;
    if (domain.global_available_invest_pool !== undefined)
      entity.global_available_invest_pool = domain.global_available_invest_pool;
    if (domain.program_membership_funded !== undefined) entity.program_membership_funded = domain.program_membership_funded;
    if (domain.program_membership_available !== undefined)
      entity.program_membership_available = domain.program_membership_available;
    if (domain.program_membership_distributed !== undefined)
      entity.program_membership_distributed = domain.program_membership_distributed;
    if (domain.program_membership_cumulative_reward_per_share !== undefined)
      entity.program_membership_cumulative_reward_per_share = domain.program_membership_cumulative_reward_per_share;
    if (domain.config !== undefined) entity.config = domain.config;

    return entity;
  }

  /**
   * Преобразование доменной сущности в данные для обновления TypeORM сущности
   * Обновляет только локальные поля базы данных, поля из блокчейна обновляются через синхронизацию
   */
  static toUpdateEntity(domain: Partial<StateDomainEntity>): Partial<StateTypeormEntity> {
    const updateData: Partial<StateTypeormEntity> = {};

    // Поля из базы данных (локальные)
    if (domain.block_num !== undefined) updateData.block_num = domain.block_num || undefined;
    if (domain.present !== undefined) updateData.present = domain.present;

    // Примечание: Все поля из блокчейна (coopname, global_available_invest_pool, program_membership_funded, etc.)
    // обновляются автоматически через систему синхронизации с блокчейном (AbstractEntitySyncService)
    // и не должны обновляться вручную через этот метод

    return updateData;
  }
}
