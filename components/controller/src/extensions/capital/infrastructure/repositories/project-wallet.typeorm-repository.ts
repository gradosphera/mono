import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ProjectWalletDomainEntity } from '../../domain/entities/project-wallet.entity';
import { ProjectWalletTypeormEntity } from '../entities/project-wallet.typeorm-entity';
import { ProjectWalletMapper } from '../mappers/project-wallet.mapper';
import type { ProjectWalletRepository } from '../../domain/repositories/project-wallet.repository';
import { CAPITAL_DATABASE_CONNECTION } from '../database/capital-database.module';

/**
 * TypeORM реализация репозитория проектных кошельков
 */
@Injectable()
export class ProjectWalletTypeormRepository implements ProjectWalletRepository {
  constructor(
    @InjectRepository(ProjectWalletTypeormEntity, CAPITAL_DATABASE_CONNECTION)
    private readonly projectWalletTypeormRepository: Repository<ProjectWalletTypeormEntity>
  ) {}

  async findByBlockchainId(blockchainId: string): Promise<ProjectWalletDomainEntity | null> {
    const entity = await this.projectWalletTypeormRepository.findOne({
      where: { blockchain_id: blockchainId },
    });

    return entity ? ProjectWalletMapper.toDomain(entity) : null;
  }

  async findByBlockNumGreaterThan(blockNum: number): Promise<ProjectWalletDomainEntity[]> {
    const entities = await this.projectWalletTypeormRepository
      .createQueryBuilder('project_wallet')
      .where('project_wallet.block_num > :blockNum', { blockNum })
      .getMany();

    return entities.map(ProjectWalletMapper.toDomain);
  }

  async createIfNotExists(blockchainData: any, blockNum: number): Promise<ProjectWalletDomainEntity> {
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

    const newEntity = new ProjectWalletDomainEntity(minimalDatabaseData, blockchainData);
    return await this.save(newEntity);
  }

  async deleteByBlockNumGreaterThan(blockNum: number): Promise<void> {
    await this.projectWalletTypeormRepository
      .createQueryBuilder()
      .delete()
      .where('block_num > :blockNum', { blockNum })
      .execute();
  }

  async update(entity: ProjectWalletDomainEntity): Promise<ProjectWalletDomainEntity> {
    const typeormEntity = ProjectWalletMapper.toEntity(entity);
    const savedEntity = await this.projectWalletTypeormRepository.save(typeormEntity as ProjectWalletTypeormEntity);
    return ProjectWalletMapper.toDomain(savedEntity);
  }

  async save(entity: ProjectWalletDomainEntity): Promise<ProjectWalletDomainEntity> {
    const typeormEntity = ProjectWalletMapper.toEntity(entity);
    const savedEntity = await this.projectWalletTypeormRepository.save(typeormEntity as ProjectWalletTypeormEntity);
    return ProjectWalletMapper.toDomain(savedEntity);
  }

  async findAll(): Promise<ProjectWalletDomainEntity[]> {
    const entities = await this.projectWalletTypeormRepository.find();
    return entities.map(ProjectWalletMapper.toDomain);
  }

  async findById(id: string): Promise<ProjectWalletDomainEntity | null> {
    const entity = await this.projectWalletTypeormRepository.findOne({
      where: { id },
    });

    return entity ? ProjectWalletMapper.toDomain(entity) : null;
  }

  async delete(id: string): Promise<void> {
    await this.projectWalletTypeormRepository.delete(id);
  }
}
