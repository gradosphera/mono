import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StateRepository } from '../../domain/repositories/state.repository';
import { StateDomainEntity } from '../../domain/entities/state.entity';
import { StateTypeormEntity } from '../entities/state.typeorm-entity';
import { StateMapper } from '../mappers/state.mapper';
import { CAPITAL_DATABASE_CONNECTION } from '../database/capital-database.module';
import type { IBlockchainSyncRepository } from '~/shared/interfaces/blockchain-sync.interface';
import { BaseBlockchainRepository } from './base-blockchain.repository';
import type { IStateBlockchainData } from '../../domain/interfaces/state-blockchain.interface';
import type { IStateDatabaseData } from '../../domain/interfaces/state-database.interface';

@Injectable()
export class StateTypeormRepository
  extends BaseBlockchainRepository<StateDomainEntity, StateTypeormEntity>
  implements StateRepository, IBlockchainSyncRepository<StateDomainEntity>
{
  constructor(
    @InjectRepository(StateTypeormEntity, CAPITAL_DATABASE_CONNECTION)
    repository: Repository<StateTypeormEntity>
  ) {
    super(repository);
  }

  protected getMapper() {
    return {
      toDomain: StateMapper.toDomain,
      toEntity: StateMapper.toEntity,
    };
  }

  protected createDomainEntity(databaseData: IStateDatabaseData, blockchainData: IStateBlockchainData): StateDomainEntity {
    return new StateDomainEntity(databaseData, blockchainData);
  }

  async create(state: Omit<StateDomainEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<StateDomainEntity> {
    const entity = this.repository.create(StateMapper.toEntity(state));
    const savedEntity = await this.repository.save(entity);
    return StateMapper.toDomain(savedEntity);
  }

  async findByCoopname(coopname: string): Promise<StateDomainEntity | null> {
    const entity = await this.repository.findOne({ where: { coopname } });
    return entity ? StateMapper.toDomain(entity) : null;
  }

  /**
   * Переопределяем метод для state, так как он использует coopname вместо id
   */
  async createIfNotExists(blockchainData: any, blockNum: number, present = true): Promise<StateDomainEntity> {
    const blockchainId = blockchainData.coopname;

    // Проверяем, существует ли уже
    const existing = await this.findByBlockchainId(blockchainId);
    if (existing) {
      // Обновляем существующую сущность
      existing.updateFromBlockchain(blockchainData, blockNum, present);
      return await this.save(existing);
    }

    // Создаем новую сущность
    const minimalDatabaseData = {
      _id: '', // Будет сгенерирован базой данных
      coopname: blockchainId,
      block_num: blockNum,
      present: present,
    };

    const newEntity = this.createDomainEntity(minimalDatabaseData, blockchainData);
    return await this.save(newEntity);
  }
}
