import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { ProjectRepository } from '../../domain/repositories/project.repository';
import { ProjectDomainEntity } from '../../domain/entities/project.entity';
import { ProjectTypeormEntity } from '../entities/project.typeorm-entity';
import { ProjectMapper } from '../mappers/project.mapper';
import { CAPITAL_DATABASE_CONNECTION } from '../database/capital-database.module';
import type { IBlockchainSyncRepository } from '~/shared/interfaces/blockchain-sync.interface';
import type { IProjectDomainInterfaceBlockchainData } from '../../domain/interfaces/project-blockchain.interface';

@Injectable()
export class ProjectTypeormRepository implements ProjectRepository, IBlockchainSyncRepository<ProjectDomainEntity> {
  constructor(
    @InjectRepository(ProjectTypeormEntity, CAPITAL_DATABASE_CONNECTION)
    private readonly repository: Repository<ProjectTypeormEntity>
  ) {}

  async create(project: Omit<ProjectDomainEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProjectDomainEntity> {
    const entity = this.repository.create(ProjectMapper.toEntity(project));
    const savedEntity = await this.repository.save(entity);
    return ProjectMapper.toDomain(savedEntity);
  }

  async findById(id: string): Promise<ProjectDomainEntity | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? ProjectMapper.toDomain(entity) : null;
  }

  async findAll(): Promise<ProjectDomainEntity[]> {
    const entities = await this.repository.find();
    return entities.map((entity) => ProjectMapper.toDomain(entity));
  }

  async findByMaster(master: string): Promise<ProjectDomainEntity[]> {
    const entities = await this.repository.find({ where: { master } });
    return entities.map((entity) => ProjectMapper.toDomain(entity));
  }

  async findByStatus(status: string): Promise<ProjectDomainEntity[]> {
    const entities = await this.repository.find({ where: { status: status as any } });
    return entities.map((entity) => ProjectMapper.toDomain(entity));
  }

  /**
   * Обновление проекта в базе данных
   * Принимает доменную сущность и обновляет соответствующие поля в TypeORM сущности
   */
  async update(entity: ProjectDomainEntity): Promise<ProjectDomainEntity> {
    // Преобразуем доменную сущность в данные для обновления
    const updateData = ProjectMapper.toUpdateEntity(entity);

    // Обновляем запись в базе данных
    await this.repository.update(entity.id, updateData);

    // Получаем обновленную сущность из базы данных
    const updatedEntity = await this.repository.findOne({ where: { id: entity.id } });
    if (!updatedEntity) {
      throw new Error(`Project with id ${entity.id} not found after update`);
    }

    // Возвращаем обновленную доменную сущность
    return ProjectMapper.toDomain(updatedEntity);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  // Методы для синхронизации блокчейна

  /**
   * Найти проект по ID блокчейна
   */
  async findByBlockchainId(blockchainId: string): Promise<ProjectDomainEntity | null> {
    const entity = await this.repository.findOne({
      where: { blockchain_id: parseInt(blockchainId) },
    });
    return entity ? ProjectMapper.toDomain(entity) : null;
  }

  /**
   * Найти проекты с номером блока больше указанного
   */
  async findByBlockNumGreaterThan(blockNum: number): Promise<ProjectDomainEntity[]> {
    const entities = await this.repository.find({
      where: { block_num: MoreThan(blockNum) },
    });
    return entities.map((entity) => ProjectMapper.toDomain(entity));
  }

  /**
   * Создать проект если не существует
   * Используется для синхронизации данных из блокчейна
   */
  async createIfNotExists(
    blockchainData: IProjectDomainInterfaceBlockchainData,
    blockNum: number,
    present = true
  ): Promise<ProjectDomainEntity> {
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
    const tempDomainEntity = new ProjectDomainEntity(minimalDatabaseData, blockchainData);

    // Используем маппер для создания TypeORM сущности
    const entity = this.repository.create(ProjectMapper.toEntity(tempDomainEntity));
    entity.block_num = blockNum; // Устанавливаем номер блока
    entity.present = present; // Устанавливаем статус существования

    const savedEntity = await this.repository.save(entity);

    return ProjectMapper.toDomain(savedEntity);
  }

  /**
   * Удалить проекты с номером блока больше указанного (для обработки форков)
   */
  async deleteByBlockNumGreaterThan(blockNum: number): Promise<void> {
    await this.repository.delete({
      block_num: MoreThan(blockNum),
    });
  }
}
