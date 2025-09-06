import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ProgramPropertyDomainEntity } from '../../domain/entities/program-property.entity';
import { ProgramPropertyTypeormEntity } from '../entities/program-property.typeorm-entity';
import { ProgramPropertyMapper } from '../mappers/program-property.mapper';
import type { ProgramPropertyRepository } from '../../domain/repositories/program-property.repository';
import { CAPITAL_DATABASE_CONNECTION } from '../database/capital-database.module';

/**
 * TypeORM реализация репозитория программных имущественных взносов
 */
@Injectable()
export class ProgramPropertyTypeormRepository implements ProgramPropertyRepository {
  constructor(
    @InjectRepository(ProgramPropertyTypeormEntity, CAPITAL_DATABASE_CONNECTION)
    private readonly programPropertyTypeormRepository: Repository<ProgramPropertyTypeormEntity>
  ) {}

  async findByBlockchainId(blockchainId: string): Promise<ProgramPropertyDomainEntity | null> {
    const entity = await this.programPropertyTypeormRepository.findOne({
      where: { blockchain_id: blockchainId },
    });

    return entity ? ProgramPropertyMapper.toDomain(entity) : null;
  }

  async findByBlockNumGreaterThan(blockNum: number): Promise<ProgramPropertyDomainEntity[]> {
    const entities = await this.programPropertyTypeormRepository
      .createQueryBuilder('program_property')
      .where('program_property.block_num > :blockNum', { blockNum })
      .getMany();

    return entities.map(ProgramPropertyMapper.toDomain);
  }

  async createIfNotExists(blockchainData: any, blockNum: number): Promise<ProgramPropertyDomainEntity> {
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

    const newEntity = new ProgramPropertyDomainEntity(minimalDatabaseData, blockchainData);
    return await this.save(newEntity);
  }

  async deleteByBlockNumGreaterThan(blockNum: number): Promise<void> {
    await this.programPropertyTypeormRepository
      .createQueryBuilder()
      .delete()
      .where('block_num > :blockNum', { blockNum })
      .execute();
  }

  async update(entity: ProgramPropertyDomainEntity): Promise<ProgramPropertyDomainEntity> {
    const typeormEntity = ProgramPropertyMapper.toEntity(entity);
    const savedEntity = await this.programPropertyTypeormRepository.save(typeormEntity as ProgramPropertyTypeormEntity);
    return ProgramPropertyMapper.toDomain(savedEntity);
  }

  async save(entity: ProgramPropertyDomainEntity): Promise<ProgramPropertyDomainEntity> {
    const typeormEntity = ProgramPropertyMapper.toEntity(entity);
    const savedEntity = await this.programPropertyTypeormRepository.save(typeormEntity as ProgramPropertyTypeormEntity);
    return ProgramPropertyMapper.toDomain(savedEntity);
  }

  async findAll(): Promise<ProgramPropertyDomainEntity[]> {
    const entities = await this.programPropertyTypeormRepository.find();
    return entities.map(ProgramPropertyMapper.toDomain);
  }

  async findById(id: string): Promise<ProgramPropertyDomainEntity | null> {
    const entity = await this.programPropertyTypeormRepository.findOne({
      where: { id },
    });

    return entity ? ProgramPropertyMapper.toDomain(entity) : null;
  }

  async delete(id: string): Promise<void> {
    await this.programPropertyTypeormRepository.delete(id);
  }
}
