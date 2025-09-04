import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import type { DeltaRepositoryPort } from '~/domain/parser/ports/delta-repository.port';
import type { DeltaDomainInterface } from '~/domain/parser/interfaces/delta-domain.interface';
import type {
  DeltaFilterDomainInterface,
  PaginatedResultDomainInterface,
} from '~/domain/parser/interfaces/parser-config-domain.interface';
import { DeltaEntity } from '../entities/delta.entity';

/**
 * TypeORM реализация репозитория дельт блокчейна
 */
@Injectable()
export class TypeOrmDeltaRepository implements DeltaRepositoryPort {
  constructor(
    @InjectRepository(DeltaEntity)
    private readonly deltaRepository: Repository<DeltaEntity>
  ) {}

  /**
   * Сохранение дельты
   */
  async save(deltaData: Omit<DeltaDomainInterface, 'id' | 'created_at'>): Promise<DeltaDomainInterface> {
    const entity = this.deltaRepository.create(deltaData);
    return await this.deltaRepository.save(entity);
  }

  /**
   * Получение дельт с фильтрацией и пагинацией
   */
  async findMany(
    filter: DeltaFilterDomainInterface,
    page: number,
    limit: number
  ): Promise<PaginatedResultDomainInterface<DeltaDomainInterface>> {
    const whereClause: any = {};

    if (filter.code) {
      whereClause.code = filter.code;
    }
    if (filter.scope) {
      whereClause.scope = filter.scope;
    }
    if (filter.table) {
      whereClause.table = filter.table;
    }
    if (filter.block_num) {
      whereClause.block_num = filter.block_num;
    }
    if (filter.primary_key) {
      whereClause.primary_key = filter.primary_key;
    }
    if (filter.present !== undefined) {
      whereClause.present = filter.present;
    }

    const [results, total] = await this.deltaRepository.findAndCount({
      where: whereClause,
      order: { block_num: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      results,
      page,
      limit,
      total,
    };
  }

  /**
   * Получение дельты по ID
   */
  async findById(id: string): Promise<DeltaDomainInterface | null> {
    return await this.deltaRepository.findOne({ where: { id } });
  }

  /**
   * Удаление дельт после указанного блока
   */
  async deleteAfterBlock(blockNum: number): Promise<void> {
    await this.deltaRepository.delete({
      block_num: MoreThan(blockNum),
    });
  }

  /**
   * Получение общего количества дельт
   */
  async count(): Promise<number> {
    return await this.deltaRepository.count();
  }

  /**
   * Получение последней дельты по номеру блока
   */
  async findLastByBlock(): Promise<DeltaDomainInterface | null> {
    return await this.deltaRepository.findOne({
      order: { block_num: 'DESC' },
    });
  }
}
