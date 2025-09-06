import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ProgramInvestDomainEntity } from '../../domain/entities/program-invest.entity';
import { ProgramInvestTypeormEntity } from '../entities/program-invest.typeorm-entity';
import { ProgramInvestMapper } from '../mappers/program-invest.mapper';
import type { ProgramInvestRepository } from '../../domain/repositories/program-invest.repository';
import { CAPITAL_DATABASE_CONNECTION } from '../database/capital-database.module';

/**
 * TypeORM реализация репозитория программных инвестиций
 */
@Injectable()
export class ProgramInvestTypeormRepository implements ProgramInvestRepository {
  constructor(
    @InjectRepository(ProgramInvestTypeormEntity, CAPITAL_DATABASE_CONNECTION)
    private readonly programInvestTypeormRepository: Repository<ProgramInvestTypeormEntity>
  ) {}

  async findByBlockchainId(blockchainId: string): Promise<ProgramInvestDomainEntity | null> {
    const entity = await this.programInvestTypeormRepository.findOne({
      where: { blockchain_id: blockchainId },
    });

    return entity ? ProgramInvestMapper.toDomain(entity) : null;
  }

  async findByBlockNumGreaterThan(blockNum: number): Promise<ProgramInvestDomainEntity[]> {
    const entities = await this.programInvestTypeormRepository
      .createQueryBuilder('program_invest')
      .where('program_invest.block_num > :blockNum', { blockNum })
      .getMany();

    return entities.map(ProgramInvestMapper.toDomain);
  }

  async createIfNotExists(blockchainData: any, blockNum: number): Promise<ProgramInvestDomainEntity> {
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

    const newEntity = new ProgramInvestDomainEntity(minimalDatabaseData, blockchainData);
    return await this.save(newEntity);
  }

  async deleteByBlockNumGreaterThan(blockNum: number): Promise<void> {
    await this.programInvestTypeormRepository
      .createQueryBuilder()
      .delete()
      .where('block_num > :blockNum', { blockNum })
      .execute();
  }

  async update(entity: ProgramInvestDomainEntity): Promise<ProgramInvestDomainEntity> {
    const typeormEntity = ProgramInvestMapper.toEntity(entity);
    const savedEntity = await this.programInvestTypeormRepository.save(typeormEntity as ProgramInvestTypeormEntity);
    return ProgramInvestMapper.toDomain(savedEntity);
  }

  async save(entity: ProgramInvestDomainEntity): Promise<ProgramInvestDomainEntity> {
    const typeormEntity = ProgramInvestMapper.toEntity(entity);
    const savedEntity = await this.programInvestTypeormRepository.save(typeormEntity as ProgramInvestTypeormEntity);
    return ProgramInvestMapper.toDomain(savedEntity);
  }

  async findAll(): Promise<ProgramInvestDomainEntity[]> {
    const entities = await this.programInvestTypeormRepository.find();
    return entities.map(ProgramInvestMapper.toDomain);
  }

  async findById(id: string): Promise<ProgramInvestDomainEntity | null> {
    const entity = await this.programInvestTypeormRepository.findOne({
      where: { id },
    });

    return entity ? ProgramInvestMapper.toDomain(entity) : null;
  }

  async delete(id: string): Promise<void> {
    await this.programInvestTypeormRepository.delete(id);
  }
}
