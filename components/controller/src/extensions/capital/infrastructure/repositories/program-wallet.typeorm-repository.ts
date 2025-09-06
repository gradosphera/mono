import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ProgramWalletDomainEntity } from '../../domain/entities/program-wallet.entity';
import { ProgramWalletTypeormEntity } from '../entities/program-wallet.typeorm-entity';
import { ProgramWalletMapper } from '../mappers/program-wallet.mapper';
import type { ProgramWalletRepository } from '../../domain/repositories/program-wallet.repository';
import { CAPITAL_DATABASE_CONNECTION } from '../database/capital-database.module';

/**
 * TypeORM реализация репозитория программных кошельков
 */
@Injectable()
export class ProgramWalletTypeormRepository implements ProgramWalletRepository {
  constructor(
    @InjectRepository(ProgramWalletTypeormEntity, CAPITAL_DATABASE_CONNECTION)
    private readonly programWalletTypeormRepository: Repository<ProgramWalletTypeormEntity>
  ) {}

  async findByBlockchainId(blockchainId: string): Promise<ProgramWalletDomainEntity | null> {
    const entity = await this.programWalletTypeormRepository.findOne({
      where: { blockchain_id: blockchainId },
    });

    return entity ? ProgramWalletMapper.toDomain(entity) : null;
  }

  async findByBlockNumGreaterThan(blockNum: number): Promise<ProgramWalletDomainEntity[]> {
    const entities = await this.programWalletTypeormRepository
      .createQueryBuilder('program_wallet')
      .where('program_wallet.block_num > :blockNum', { blockNum })
      .getMany();

    return entities.map(ProgramWalletMapper.toDomain);
  }

  async createIfNotExists(blockchainData: any, blockNum: number): Promise<ProgramWalletDomainEntity> {
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

    const newEntity = new ProgramWalletDomainEntity(minimalDatabaseData, blockchainData);
    return await this.save(newEntity);
  }

  async deleteByBlockNumGreaterThan(blockNum: number): Promise<void> {
    await this.programWalletTypeormRepository
      .createQueryBuilder()
      .delete()
      .where('block_num > :blockNum', { blockNum })
      .execute();
  }

  async update(entity: ProgramWalletDomainEntity): Promise<ProgramWalletDomainEntity> {
    const typeormEntity = ProgramWalletMapper.toEntity(entity);
    const savedEntity = await this.programWalletTypeormRepository.save(typeormEntity as ProgramWalletTypeormEntity);
    return ProgramWalletMapper.toDomain(savedEntity);
  }

  async save(entity: ProgramWalletDomainEntity): Promise<ProgramWalletDomainEntity> {
    const typeormEntity = ProgramWalletMapper.toEntity(entity);
    const savedEntity = await this.programWalletTypeormRepository.save(typeormEntity as ProgramWalletTypeormEntity);
    return ProgramWalletMapper.toDomain(savedEntity);
  }

  async findAll(): Promise<ProgramWalletDomainEntity[]> {
    const entities = await this.programWalletTypeormRepository.find();
    return entities.map(ProgramWalletMapper.toDomain);
  }

  async findById(id: string): Promise<ProgramWalletDomainEntity | null> {
    const entity = await this.programWalletTypeormRepository.findOne({
      where: { id },
    });

    return entity ? ProgramWalletMapper.toDomain(entity) : null;
  }

  async delete(id: string): Promise<void> {
    await this.programWalletTypeormRepository.delete(id);
  }
}
