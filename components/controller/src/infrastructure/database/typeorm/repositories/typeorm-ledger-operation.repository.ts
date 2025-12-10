import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LedgerOperationRepository } from '~/domain/ledger/repositories/ledger-operation.repository';
import { LedgerOperationDomainEntity } from '~/domain/ledger/entities/ledger-operation-domain.entity';
import { LedgerOperationEntity } from '../entities/ledger-operation.entity';
import type { GetLedgerHistoryInputDomainInterface, LedgerHistoryResponseDomainInterface } from '~/domain/ledger/interfaces';

/**
 * TypeORM реализация репозитория для операций ledger
 */
@Injectable()
export class TypeOrmLedgerOperationRepository implements LedgerOperationRepository {
  constructor(
    @InjectRepository(LedgerOperationEntity)
    private readonly ledgerOperationRepository: Repository<LedgerOperationEntity>
  ) {}

  async save(operation: LedgerOperationDomainEntity): Promise<void> {
    // Создаем entity для сохранения в БД
    const entity = this.ledgerOperationRepository.create({
      global_sequence: operation.global_sequence,
      coopname: operation.coopname,
      action: operation.action,
      created_at: operation.created_at,
      account_id: operation.account_id,
      quantity: operation.quantity,
      comment: operation.comment,
      hash: operation.hash,
      username: operation.username,
    });

    // Используем upsert (ON CONFLICT DO UPDATE) по global_sequence
    await this.ledgerOperationRepository.save(entity);
  }

  async getHistory(params: GetLedgerHistoryInputDomainInterface): Promise<LedgerHistoryResponseDomainInterface> {
    const queryBuilder = this.ledgerOperationRepository
      .createQueryBuilder('op')
      .where('op.coopname = :coopname', { coopname: params.coopname });

    // Фильтр по account_id если указан
    if (params.account_id !== undefined) {
      queryBuilder.andWhere('op.account_id = :account_id', { account_id: params.account_id });
    }

    // Сортировка
    const sortBy = params.sortBy || 'created_at';
    const sortOrder = params.sortOrder || 'DESC';
    queryBuilder.orderBy(`op.${sortBy}`, sortOrder);

    // Подсчет общего количества
    const totalCount = await queryBuilder.getCount();

    // Пагинация
    const page = params.page || 1;
    const limit = params.limit || 10;
    const offset = (page - 1) * limit;

    queryBuilder.limit(limit);
    queryBuilder.offset(offset);

    // Получение результатов
    const entities = await queryBuilder.getMany();

    // Преобразование в доменные интерфейсы
    const operations = entities.map((entity) => {
      return {
        global_sequence: entity.global_sequence,
        coopname: entity.coopname,
        action: entity.action,
        created_at: entity.created_at,
        account_id: entity.account_id,
        quantity: entity.quantity,
        comment: entity.comment,
        hash: entity.hash,
        username: entity.username,
      };
    });

    const totalPages = Math.ceil(totalCount / limit);

    return {
      items: operations,
      totalCount,
      totalPages,
      currentPage: page,
    };
  }

  async findByGlobalSequence(global_sequence: number): Promise<LedgerOperationDomainEntity | null> {
    const entity = await this.ledgerOperationRepository.findOne({
      where: { global_sequence },
    });

    if (!entity) {
      return null;
    }

    const operationData = {
      global_sequence: entity.global_sequence,
      coopname: entity.coopname,
      action: entity.action,
      created_at: entity.created_at,
      account_id: entity.account_id,
      quantity: entity.quantity,
      comment: entity.comment,
      hash: entity.hash,
      username: entity.username,
    };

    return new LedgerOperationDomainEntity(operationData);
  }
}
