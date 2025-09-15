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
import type { TableStateDomainInterface } from '~/domain/parser/interfaces/table-state-domain.interface';

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

  /**
   * Получение текущих состояний таблиц с фильтрами
   * Получает самые последние записи для каждой группы, затем исключает удаленные объекты
   * Если самая последняя запись имеет present = false, объект считается удаленным и не возвращается
   */
  async findCurrentTableStates(
    filters: {
      code?: string;
      scope?: string;
      table?: string;
    } = {}
  ): Promise<TableStateDomainInterface[]> {
    let whereClause = '';
    const parameters: any[] = [];

    // Применяем фильтры
    if (filters.code) {
      whereClause += ' AND code = $' + (parameters.length + 1);
      parameters.push(filters.code);
    }
    if (filters.scope) {
      whereClause += ' AND scope = $' + (parameters.length + 1);
      parameters.push(filters.scope);
    }
    if (filters.table) {
      whereClause += ' AND "table" = $' + (parameters.length + 1);
      parameters.push(filters.table);
    }

    // Сначала получаем все последние записи без фильтрации по present
    const query = `
      SELECT DISTINCT ON (code, scope, "table", primary_key)
        code,
        scope,
        "table",
        primary_key,
        value,
        block_num,
        created_at,
        present
      FROM blockchain_deltas
      WHERE 1=1 ${whereClause}
      ORDER BY code ASC, scope ASC, "table" ASC, primary_key ASC, block_num DESC
    `;

    const result = await this.deltaRepository.query(query, parameters);

    // Фильтруем результат: исключаем записи, где самая последняя версия имеет present = false
    const filteredResult = result.filter((row: any) => row.present === true);

    return filteredResult.map((row: any) => ({
      code: row.code,
      scope: row.scope,
      table: row.table,
      primary_key: row.primary_key,
      value: row.value,
      block_num: row.block_num,
      created_at: row.created_at,
    }));
  }

  /**
   * Получение текущих состояний таблиц с фильтрами и пагинацией
   * Использует оконные функции PostgreSQL для эффективной пагинации
   */
  async findCurrentTableStatesPaginated(
    filters: {
      code?: string;
      scope?: string;
      table?: string;
    } = {},
    page: number,
    limit: number
  ): Promise<PaginatedResultDomainInterface<TableStateDomainInterface>> {
    const parameters: any[] = [];
    let whereClause = '';

    // Применяем фильтры
    if (filters.code) {
      whereClause += ' AND code = $' + (parameters.length + 1);
      parameters.push(filters.code);
    }
    if (filters.scope) {
      whereClause += ' AND scope = $' + (parameters.length + 1);
      parameters.push(filters.scope);
    }
    if (filters.table) {
      whereClause += ' AND "table" = $' + (parameters.length + 1);
      parameters.push(filters.table);
    }

    // Добавляем параметры пагинации
    const offset = (page - 1) * limit;
    parameters.push(limit, offset);

    // SQL запрос с пагинацией используя ROW_NUMBER
    const query = `
      WITH latest_records AS (
        SELECT DISTINCT ON (code, scope, "table", primary_key)
          code,
          scope,
          "table",
          primary_key,
          value,
          block_num,
          created_at
        FROM blockchain_deltas
        WHERE present = true ${whereClause}
        ORDER BY code ASC, scope ASC, "table" ASC, primary_key ASC, block_num DESC
      ),
      numbered_records AS (
        SELECT
          *,
          ROW_NUMBER() OVER (ORDER BY code ASC, scope ASC, "table" ASC, primary_key ASC) as row_num,
          COUNT(*) OVER () as total_count
        FROM latest_records
      )
      SELECT
        code,
        scope,
        "table",
        primary_key,
        value,
        block_num,
        created_at,
        total_count
      FROM numbered_records
      WHERE row_num > $1 AND row_num <= $1 + $2
      ORDER BY row_num
    `;

    const result = await this.deltaRepository.query(query, [offset, limit]);

    if (result.length === 0) {
      return {
        results: [],
        page,
        limit,
        total: 0,
      };
    }

    const total = parseInt(result[0].total_count);

    return {
      results: result.map((row: any) => ({
        code: row.code,
        scope: row.scope,
        table: row.table,
        primary_key: row.primary_key,
        value: row.value,
        block_num: row.block_num,
        created_at: row.created_at,
      })),
      page,
      limit,
      total,
    };
  }
}
