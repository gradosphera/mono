import { Injectable, Inject } from '@nestjs/common';
import type { ActionDomainInterface } from '../interfaces/action-domain.interface';
import type { DeltaDomainInterface } from '../interfaces/delta-domain.interface';
import type {
  ActionFilterDomainInterface,
  DeltaFilterDomainInterface,
  PaginatedResultDomainInterface,
} from '../interfaces/parser-config-domain.interface';
import type { ActionRepositoryPort, DeltaRepositoryPort, SyncStateRepositoryPort } from '../ports/parser.port';
import { ACTION_REPOSITORY_PORT, DELTA_REPOSITORY_PORT, SYNC_STATE_REPOSITORY_PORT } from '../ports/parser.port';

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
    console.log(`Очищаем действия и дельты после блока: ${sinceBlock}`);

    await Promise.all([
      this.actionRepository.deleteAfterBlock(sinceBlock),
      this.deltaRepository.deleteAfterBlock(sinceBlock),
    ]);

    console.log('Очистка завершена');
  }

  /**
   * Получение статистики парсера
   */
  async getStats(): Promise<{
    actionsCount: number;
    deltasCount: number;
    lastActionBlock: number | null;
    lastDeltaBlock: number | null;
    currentBlock: number;
  }> {
    const [actionsCount, deltasCount, lastAction, lastDelta, currentBlock] = await Promise.all([
      this.actionRepository.count(),
      this.deltaRepository.count(),
      this.actionRepository.findLastByBlock(),
      this.deltaRepository.findLastByBlock(),
      this.syncStateRepository.getCurrentBlock(),
    ]);

    return {
      actionsCount,
      deltasCount,
      lastActionBlock: lastAction?.block_num || null,
      lastDeltaBlock: lastDelta?.block_num || null,
      currentBlock,
    };
  }
}
