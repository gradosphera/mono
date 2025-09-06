import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ProjectPropertyDomainEntity } from '../../domain/entities/project-property.entity';
import { ProjectPropertyTypeormEntity } from '../entities/project-property.typeorm-entity';
import { ProjectPropertyMapper } from '../mappers/project-property.mapper';
import type { ProjectPropertyRepository } from '../../domain/repositories/project-property.repository';
import { CAPITAL_DATABASE_CONNECTION } from '../database/capital-database.module';

/**
 * TypeORM реализация репозитория проектных имущественных взносов
 */
@Injectable()
export class ProjectPropertyTypeormRepository implements ProjectPropertyRepository {
  constructor(
    @InjectRepository(ProjectPropertyTypeormEntity, CAPITAL_DATABASE_CONNECTION)
    private readonly projectPropertyTypeormRepository: Repository<ProjectPropertyTypeormEntity>
  ) {}

  async findByBlockchainId(blockchainId: string): Promise<ProjectPropertyDomainEntity | null> {
    const entity = await this.projectPropertyTypeormRepository.findOne({
      where: { blockchain_id: blockchainId },
    });

    return entity ? ProjectPropertyMapper.toDomain(entity) : null;
  }

  async findByBlockNumGreaterThan(blockNum: number): Promise<ProjectPropertyDomainEntity[]> {
    const entities = await this.projectPropertyTypeormRepository
      .createQueryBuilder('project_property')
      .where('project_property.block_num > :blockNum', { blockNum })
      .getMany();

    return entities.map(ProjectPropertyMapper.toDomain);
  }

  async createIfNotExists(blockchainData: any, blockNum: number): Promise<ProjectPropertyDomainEntity> {
    const blockchainId = blockchainData.id.toString();

    const existingEntity = await this.findByBlockchainId(blockchainId);

    if (existingEntity) {
      // Обновляем существующую сущность
      existingEntity.updateFromBlockchain(blockchainData, blockNum);
      await this.save(existingEntity);
      return existingEntity;
    }

    // Создаем новую сущность
    const minimalDatabaseData = {
      id: '', // Будет сгенерирован TypeORM
      blockchain_id: blockchainId,
      block_num: blockNum,
      present: true,
    };

    const newEntity = new ProjectPropertyDomainEntity(minimalDatabaseData, blockchainData);
    return await this.save(newEntity);
  }

  async deleteByBlockNumGreaterThan(blockNum: number): Promise<void> {
    await this.projectPropertyTypeormRepository
      .createQueryBuilder()
      .delete()
      .where('block_num > :blockNum', { blockNum })
      .execute();
  }

  async update(entity: ProjectPropertyDomainEntity): Promise<ProjectPropertyDomainEntity> {
    const typeormEntity = ProjectPropertyMapper.toEntity(entity);
    const savedEntity = await this.projectPropertyTypeormRepository.save(typeormEntity as ProjectPropertyTypeormEntity);
    return ProjectPropertyMapper.toDomain(savedEntity);
  }

  async save(entity: ProjectPropertyDomainEntity): Promise<ProjectPropertyDomainEntity> {
    const typeormEntity = ProjectPropertyMapper.toEntity(entity);
    const savedEntity = await this.projectPropertyTypeormRepository.save(typeormEntity as ProjectPropertyTypeormEntity);
    return ProjectPropertyMapper.toDomain(savedEntity);
  }

  async findAll(): Promise<ProjectPropertyDomainEntity[]> {
    const entities = await this.projectPropertyTypeormRepository.find();
    return entities.map(ProjectPropertyMapper.toDomain);
  }

  async findById(id: string): Promise<ProjectPropertyDomainEntity | null> {
    const entity = await this.projectPropertyTypeormRepository.findOne({
      where: { id },
    });

    return entity ? ProjectPropertyMapper.toDomain(entity) : null;
  }

  async delete(id: string): Promise<void> {
    await this.projectPropertyTypeormRepository.delete(id);
  }
}
