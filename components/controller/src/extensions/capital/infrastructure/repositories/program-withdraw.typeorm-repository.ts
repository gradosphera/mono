import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ProgramWithdrawDomainEntity } from '../../domain/entities/program-withdraw.entity';
import { ProgramWithdrawTypeormEntity } from '../entities/program-withdraw.typeorm-entity';
import { ProgramWithdrawMapper } from '../mappers/program-withdraw.mapper';
import type { ProgramWithdrawRepository } from '../../domain/repositories/program-withdraw.repository';
import { CAPITAL_DATABASE_CONNECTION } from '../database/capital-database.module';

/**
 * TypeORM реализация репозитория возвратов из программы
 */
@Injectable()
export class ProgramWithdrawTypeormRepository implements ProgramWithdrawRepository {
  constructor(
    @InjectRepository(ProgramWithdrawTypeormEntity, CAPITAL_DATABASE_CONNECTION)
    private readonly programWithdrawTypeormRepository: Repository<ProgramWithdrawTypeormEntity>
  ) {}

  async findByBlockchainId(blockchainId: string): Promise<ProgramWithdrawDomainEntity | null> {
    const entity = await this.programWithdrawTypeormRepository.findOne({
      where: { blockchain_id: blockchainId },
    });

    return entity ? ProgramWithdrawMapper.toDomain(entity) : null;
  }

  async findByBlockNumGreaterThan(blockNum: number): Promise<ProgramWithdrawDomainEntity[]> {
    const entities = await this.programWithdrawTypeormRepository
      .createQueryBuilder('program_withdraw')
      .where('program_withdraw.block_num > :blockNum', { blockNum })
      .getMany();

    return entities.map(ProgramWithdrawMapper.toDomain);
  }

  async createIfNotExists(blockchainData: any, blockNum: number): Promise<ProgramWithdrawDomainEntity> {
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

    const newEntity = new ProgramWithdrawDomainEntity(minimalDatabaseData, blockchainData);
    return await this.save(newEntity);
  }

  async deleteByBlockNumGreaterThan(blockNum: number): Promise<void> {
    await this.programWithdrawTypeormRepository
      .createQueryBuilder()
      .delete()
      .where('block_num > :blockNum', { blockNum })
      .execute();
  }

  async update(entity: ProgramWithdrawDomainEntity): Promise<ProgramWithdrawDomainEntity> {
    const typeormEntity = ProgramWithdrawMapper.toEntity(entity);
    const savedEntity = await this.programWithdrawTypeormRepository.save(typeormEntity as ProgramWithdrawTypeormEntity);
    return ProgramWithdrawMapper.toDomain(savedEntity);
  }

  async save(entity: ProgramWithdrawDomainEntity): Promise<ProgramWithdrawDomainEntity> {
    const typeormEntity = ProgramWithdrawMapper.toEntity(entity);
    const savedEntity = await this.programWithdrawTypeormRepository.save(typeormEntity as ProgramWithdrawTypeormEntity);
    return ProgramWithdrawMapper.toDomain(savedEntity);
  }

  async findAll(): Promise<ProgramWithdrawDomainEntity[]> {
    const entities = await this.programWithdrawTypeormRepository.find();
    return entities.map(ProgramWithdrawMapper.toDomain);
  }

  async findById(id: string): Promise<ProgramWithdrawDomainEntity | null> {
    const entity = await this.programWithdrawTypeormRepository.findOne({
      where: { id },
    });

    return entity ? ProgramWithdrawMapper.toDomain(entity) : null;
  }

  async delete(id: string): Promise<void> {
    await this.programWithdrawTypeormRepository.delete(id);
  }
}
