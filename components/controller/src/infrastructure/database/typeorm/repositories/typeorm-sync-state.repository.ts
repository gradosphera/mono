import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { SyncStateRepositoryPort } from '~/domain/parser/ports/sync-state-repository.port';
import { SyncStateEntity } from '../entities/sync-state.entity';

/**
 * TypeORM реализация репозитория состояния синхронизации блокчейна
 */
@Injectable()
export class TypeOrmSyncStateRepository implements SyncStateRepositoryPort {
  constructor(
    @InjectRepository(SyncStateEntity)
    private readonly syncStateRepository: Repository<SyncStateEntity>
  ) {}

  /**
   * Получение текущего блока синхронизации
   */
  async getCurrentBlock(): Promise<number> {
    const syncState = await this.syncStateRepository.findOne({
      where: { key: 'currentBlock' },
    });

    return syncState ? Number(syncState.block_num) : 0;
  }

  /**
   * Обновление текущего блока синхронизации
   */
  async updateCurrentBlock(blockNum: number): Promise<void> {
    await this.syncStateRepository.save({
      key: 'currentBlock',
      block_num: blockNum,
    });
  }
}
