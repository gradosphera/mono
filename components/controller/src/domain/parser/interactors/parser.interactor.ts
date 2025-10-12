import { Injectable, Inject } from '@nestjs/common';
import type { ActionDomainInterface } from '../interfaces/action-domain.interface';
import type { DeltaDomainInterface } from '../interfaces/delta-domain.interface';
import type { ForkDomainInterface } from '../interfaces/fork-domain.interface';
import type {
  ActionFilterDomainInterface,
  DeltaFilterDomainInterface,
  PaginatedResultDomainInterface,
} from '../interfaces/parser-config-domain.interface';
import type { ActionRepositoryPort } from '../ports/action-repository.port';
import type { DeltaRepositoryPort } from '../ports/delta-repository.port';
import type { ForkRepositoryPort } from '../ports/fork-repository.port';
import type { SyncStateRepositoryPort } from '../ports/sync-state-repository.port';
import { ACTION_REPOSITORY_PORT } from '../ports/action-repository.port';
import { DELTA_REPOSITORY_PORT } from '../ports/delta-repository.port';
import { FORK_REPOSITORY_PORT } from '../ports/fork-repository.port';
import { SYNC_STATE_REPOSITORY_PORT } from '../ports/sync-state-repository.port';

/**
 * Интерактор парсера блокчейна
 * Содержит бизнес-логику работы с действиями и дельтами
 */
@Injectable()
export class ParserInteractor {
  constructor(
    @Inject(ACTION_REPOSITORY_PORT)
    private readonly actionRepository: ActionRepositoryPort,
    @Inject(DELTA_REPOSITORY_PORT)
    private readonly deltaRepository: DeltaRepositoryPort,
    @Inject(FORK_REPOSITORY_PORT)
    private readonly forkRepository: ForkRepositoryPort,
    @Inject(SYNC_STATE_REPOSITORY_PORT)
    private readonly syncStateRepository: SyncStateRepositoryPort
  ) {}

  /**
   * Сохранение действия блокчейна
   */
  async saveAction(actionData: Omit<ActionDomainInterface, 'id' | 'created_at'>): Promise<ActionDomainInterface> {
    return await this.actionRepository.save(actionData);
  }

  /**
   * Сохранение дельты таблицы блокчейна
   */
  async saveDelta(deltaData: Omit<DeltaDomainInterface, 'id' | 'created_at'>): Promise<DeltaDomainInterface> {
    return await this.deltaRepository.save(deltaData);
  }

  /**
   * Сохранение форка блокчейна
   */
  async saveFork(forkData: Omit<ForkDomainInterface, 'id' | 'created_at'>): Promise<ForkDomainInterface> {
    return await this.forkRepository.save(forkData);
  }

  /**
   * Получение действий с фильтрацией и пагинацией
   */
  async getActions(
    filter: ActionFilterDomainInterface = {},
    page = 1,
    limit = 10
  ): Promise<PaginatedResultDomainInterface<ActionDomainInterface>> {
    return await this.actionRepository.findMany(filter, page, limit);
  }

  /**
   * Получение дельт с фильтрацией и пагинацией
   */
  async getDeltas(
    filter: DeltaFilterDomainInterface = {},
    page = 1,
    limit = 10
  ): Promise<PaginatedResultDomainInterface<DeltaDomainInterface>> {
    return await this.deltaRepository.findMany(filter, page, limit);
  }

  /**
   * Получение текущего блока синхронизации
   */
  async getCurrentBlock(): Promise<number> {
    return await this.syncStateRepository.getCurrentBlock();
  }

  /**
   * Обновление текущего блока синхронизации
   */
  async updateCurrentBlock(blockNum: number): Promise<void> {
    await this.syncStateRepository.updateCurrentBlock(blockNum);
  }

  /**
   * Очистка данных после указанного блока (для репарсинга)
   */
  async purgeAfterBlock(sinceBlock: number): Promise<void> {
    console.log(`Очищаем действия, дельты и форки после блока: ${sinceBlock}`);

    await Promise.all([
      this.actionRepository.deleteAfterBlock(sinceBlock),
      this.deltaRepository.deleteAfterBlock(sinceBlock),
      this.forkRepository.deleteAfterBlock(sinceBlock),
    ]);

    console.log('Очистка завершена');
  }

  /**
   * Сброс флага repeat для дельты
   */
  async resetDeltaRepeatFlag(id: string): Promise<void> {
    await this.deltaRepository.resetRepeatFlag(id);
  }

  /**
   * Сброс флага repeat для действия
   */
  async resetActionRepeatFlag(id: string): Promise<void> {
    await this.actionRepository.resetRepeatFlag(id);
  }

  /**
   * Получение статистики парсера
   */
  async getStats(): Promise<{
    actionsCount: number;
    deltasCount: number;
    forksCount: number;
    lastActionBlock: number | null;
    lastDeltaBlock: number | null;
    lastForkBlock: number | null;
    currentBlock: number;
  }> {
    const [actionsCount, deltasCount, forksCount, lastAction, lastDelta, lastFork, currentBlock] = await Promise.all([
      this.actionRepository.count(),
      this.deltaRepository.count(),
      this.forkRepository.count(),
      this.actionRepository.findLastByBlock(),
      this.deltaRepository.findLastByBlock(),
      this.forkRepository.findLastByBlock(),
      this.syncStateRepository.getCurrentBlock(),
    ]);

    return {
      actionsCount,
      deltasCount,
      forksCount,
      lastActionBlock: lastAction?.block_num || null,
      lastDeltaBlock: lastDelta?.block_num || null,
      lastForkBlock: lastFork?.block_num || null,
      currentBlock,
    };
  }
}
