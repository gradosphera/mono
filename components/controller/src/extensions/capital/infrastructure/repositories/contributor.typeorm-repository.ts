import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { ContributorRepository } from '../../domain/repositories/contributor.repository';
import { ContributorDomainEntity } from '../../domain/entities/contributor.entity';
import { ContributorTypeormEntity } from '../entities/contributor.typeorm-entity';
import { ContributorMapper } from '../mappers/contributor.mapper';
import { CAPITAL_DATABASE_CONNECTION } from '../database/capital-database.module';
import type { IBlockchainSyncRepository } from '~/shared/interfaces/blockchain-sync.interface';
import type { IContributorBlockchainData } from '../../domain/interfaces/contributor-blockchain.interface';

@Injectable()
export class ContributorTypeormRepository
  implements ContributorRepository, IBlockchainSyncRepository<ContributorDomainEntity>
{
  constructor(
    @InjectRepository(ContributorTypeormEntity, CAPITAL_DATABASE_CONNECTION)
    private readonly repository: Repository<ContributorTypeormEntity>
  ) {}

  async create(
    contributor: Omit<ContributorDomainEntity, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ContributorDomainEntity> {
    const entity = this.repository.create(ContributorMapper.toEntity(contributor));
    const savedEntity = await this.repository.save(entity);
    return ContributorMapper.toDomain(savedEntity);
  }

  async findById(id: string): Promise<ContributorDomainEntity | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? ContributorMapper.toDomain(entity) : null;
  }

  async findAll(): Promise<ContributorDomainEntity[]> {
    const entities = await this.repository.find();
    return entities.map((entity) => ContributorMapper.toDomain(entity));
  }

  async findByUsername(username: string): Promise<ContributorDomainEntity[]> {
    const entities = await this.repository.find({ where: { username } });
    return entities.map((entity) => ContributorMapper.toDomain(entity));
  }

  async findByStatus(status: string): Promise<ContributorDomainEntity[]> {
    const entities = await this.repository.find({ where: { status: status as any } });
    return entities.map((entity) => ContributorMapper.toDomain(entity));
  }

  /**
   * Обновление вкладчика в базе данных
   * Принимает доменную сущность и обновляет соответствующие поля в TypeORM сущности
   */
  async update(entity: ContributorDomainEntity): Promise<ContributorDomainEntity> {
    // Преобразуем доменную сущность в данные для обновления
    const updateData = ContributorMapper.toUpdateEntity(entity);

    // Обновляем запись в базе данных
    await this.repository.update(entity.id, updateData);

    // Получаем обновленную сущность из базы данных
    const updatedEntity = await this.repository.findOne({ where: { id: entity.id } });
    if (!updatedEntity) {
      throw new Error(`Contributor with id ${entity.id} not found after update`);
    }

    // Возвращаем обновленную доменную сущность
    return ContributorMapper.toDomain(updatedEntity);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  // Методы для синхронизации блокчейна

  /**
   * Найти вкладчика по ID блокчейна
   */
  async findByBlockchainId(blockchainId: string): Promise<ContributorDomainEntity | null> {
    const entity = await this.repository.findOne({
      where: { blockchain_id: blockchainId },
    });
    return entity ? ContributorMapper.toDomain(entity) : null;
  }

  /**
   * Найти вкладчиков с номером блока больше указанного
   */
  async findByBlockNumGreaterThan(blockNum: number): Promise<ContributorDomainEntity[]> {
    const entities = await this.repository.find({
      where: { block_num: MoreThan(blockNum) },
    });
    return entities.map((entity) => ContributorMapper.toDomain(entity));
  }

  /**
   * Создать вкладчика если не существует
   * Используется для синхронизации данных из блокчейна
   */
  async createIfNotExists(
    blockchainData: IContributorBlockchainData,
    blockNum: number,
    present = true
  ): Promise<ContributorDomainEntity> {
    const blockchainId = blockchainData.id.toString();

    // Проверяем, существует ли уже
    const existing = await this.findByBlockchainId(blockchainId);
    if (existing) {
      return existing;
    }

    // Создаем доменную сущность с минимальными данными для базы данных
    // Остальные данные будут храниться только в доменной сущности
    const minimalDatabaseData = {
      id: '', // Будет сгенерирован базой данных
      blockchain_id: blockchainId,
      block_num: blockNum,
      present: present,
    };

    // Создаем временную доменную сущность для использования в маппере
    const tempDomainEntity = new ContributorDomainEntity(minimalDatabaseData, blockchainData);

    // Используем маппер для создания TypeORM сущности
    const entity = this.repository.create(ContributorMapper.toEntity(tempDomainEntity));
    entity.block_num = blockNum; // Устанавливаем номер блока
    entity.present = present; // Устанавливаем статус существования

    const savedEntity = await this.repository.save(entity);

    return ContributorMapper.toDomain(savedEntity);
  }

  /**
   * Удалить вкладчиков с номером блока больше указанного (для обработки форков)
   */
  async deleteByBlockNumGreaterThan(blockNum: number): Promise<void> {
    await this.repository.delete({
      block_num: MoreThan(blockNum),
    });
  }
}
