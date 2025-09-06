import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { ResultRepository } from '../../domain/repositories/result.repository';
import { ResultDomainEntity } from '../../domain/entities/result.entity';
import { ResultTypeormEntity } from '../entities/result.typeorm-entity';
import { ResultMapper } from '../mappers/result.mapper';
import { CAPITAL_DATABASE_CONNECTION } from '../database/capital-database.module';
import type { IBlockchainSyncRepository } from '~/shared/interfaces/blockchain-sync.interface';
import type { IResultBlockchainData } from '../../domain/interfaces/result-blockchain.interface';

@Injectable()
export class ResultTypeormRepository implements ResultRepository, IBlockchainSyncRepository<ResultDomainEntity> {
  constructor(
    @InjectRepository(ResultTypeormEntity, CAPITAL_DATABASE_CONNECTION)
    private readonly repository: Repository<ResultTypeormEntity>
  ) {}

  async create(result: Omit<ResultDomainEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<ResultDomainEntity> {
    const entity = this.repository.create(ResultMapper.toEntity(result));
    const savedEntity = await this.repository.save(entity);
    return ResultMapper.toDomain(savedEntity);
  }

  async findById(id: string): Promise<ResultDomainEntity | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? ResultMapper.toDomain(entity) : null;
  }

  async findAll(): Promise<ResultDomainEntity[]> {
    const entities = await this.repository.find();
    return entities.map((entity) => ResultMapper.toDomain(entity));
  }

  async findByUsername(username: string): Promise<ResultDomainEntity[]> {
    const entities = await this.repository.find({ where: { username } });
    return entities.map((entity) => ResultMapper.toDomain(entity));
  }

  async findByProjectHash(projectHash: string): Promise<ResultDomainEntity[]> {
    const entities = await this.repository.find({ where: { project_hash: projectHash } });
    return entities.map((entity) => ResultMapper.toDomain(entity));
  }

  async findByStatus(status: string): Promise<ResultDomainEntity[]> {
    const entities = await this.repository.find({ where: { status: status as any } });
    return entities.map((entity) => ResultMapper.toDomain(entity));
  }

  /**
   * Обновление результата в базе данных
   * Принимает доменную сущность и обновляет соответствующие поля в TypeORM сущности
   */
  async update(entity: ResultDomainEntity): Promise<ResultDomainEntity> {
    // Преобразуем доменную сущность в данные для обновления
    const updateData = ResultMapper.toUpdateEntity(entity);

    // Обновляем запись в базе данных
    await this.repository.update(entity.id, updateData);

    // Получаем обновленную сущность из базы данных
    const updatedEntity = await this.repository.findOne({ where: { id: entity.id } });
    if (!updatedEntity) {
      throw new Error(`Result with id ${entity.id} not found after update`);
    }

    // Возвращаем обновленную доменную сущность
    return ResultMapper.toDomain(updatedEntity);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  // Методы для синхронизации блокчейна

  /**
   * Найти результат по ID блокчейна
   */
  async findByBlockchainId(blockchainId: string): Promise<ResultDomainEntity | null> {
    const entity = await this.repository.findOne({
      where: { blockchain_id: blockchainId },
    });
    return entity ? ResultMapper.toDomain(entity) : null;
  }

  /**
   * Найти результаты с номером блока больше указанного
   */
  async findByBlockNumGreaterThan(blockNum: number): Promise<ResultDomainEntity[]> {
    const entities = await this.repository.find({
      where: { block_num: MoreThan(blockNum) },
    });
    return entities.map((entity) => ResultMapper.toDomain(entity));
  }

  /**
   * Создать результат если не существует
   * Используется для синхронизации данных из блокчейна
   */
  async createIfNotExists(
    blockchainData: IResultBlockchainData,
    blockNum: number,
    present = true
  ): Promise<ResultDomainEntity> {
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
    const tempDomainEntity = new ResultDomainEntity(minimalDatabaseData, blockchainData);

    // Используем маппер для создания TypeORM сущности
    const entity = this.repository.create(ResultMapper.toEntity(tempDomainEntity));
    entity.block_num = blockNum; // Устанавливаем номер блока
    entity.present = present; // Устанавливаем статус существования

    const savedEntity = await this.repository.save(entity);

    return ResultMapper.toDomain(savedEntity);
  }

  /**
   * Удалить результаты с номером блока больше указанного (для обработки форков)
   */
  async deleteByBlockNumGreaterThan(blockNum: number): Promise<void> {
    await this.repository.delete({
      block_num: MoreThan(blockNum),
    });
  }
}
