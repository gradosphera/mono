import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import { OnEvent, EventEmitter2 } from '@nestjs/event-emitter';
import type { IDelta } from '~/types/common';
import { WinstonLoggerService } from '~/application/logger/logger-app.service';
import { AbstractEntitySyncService } from '../../../../../shared/services/abstract-entity-sync.service';
import { ProjectDomainEntity } from '../../../domain/entities/project.entity';
import { ProjectRepository, PROJECT_REPOSITORY } from '../../../domain/repositories/project.repository';
import { ProjectDeltaMapper } from '../mappers/project-delta.mapper';
import type { IProjectDomainInterfaceBlockchainData } from '../../../domain/interfaces/project-blockchain.interface';

/**
 * Сервис синхронизации проектов с блокчейном
 *
 * Подписывается на дельты таблицы projects контракта capital
 * и синхронизирует данные проектов в локальной базе данных
 */
@Injectable()
export class ProjectSyncService
  extends AbstractEntitySyncService<ProjectDomainEntity, IProjectDomainInterfaceBlockchainData>
  implements OnModuleInit
{
  protected readonly entityName = 'Project';

  constructor(
    @Inject(PROJECT_REPOSITORY)
    projectRepository: ProjectRepository,
    projectDeltaMapper: ProjectDeltaMapper,
    logger: WinstonLoggerService,
    private readonly eventEmitter: EventEmitter2
  ) {
    super(projectRepository, projectDeltaMapper, logger);
  }

  async onModuleInit() {
    const supportedVersions = this.getSupportedVersions();
    this.logger.log(
      `Project sync service initialized. Supporting contracts: [${supportedVersions.contracts.join(
        ', '
      )}], tables: [${supportedVersions.tables.join(', ')}]`
    );

    // Программная подписка на все поддерживаемые паттерны событий
    const allPatterns = this.getAllEventNames();
    this.logger.log(`Subscribing to ${allPatterns.length} event patterns: ${allPatterns.join(', ')}`);

    // Подписываемся на каждый паттерн программно
    allPatterns.forEach((pattern) => {
      this.eventEmitter.on(pattern, this.handleProjectDelta.bind(this));
    });

    this.logger.log('Project sync service fully initialized with pattern subscriptions');
  }

  /**
   * Обработка дельт проектов из блокчейна
   * Теперь вызывается программно для всех поддерживаемых паттернов
   */
  private async handleProjectDelta(delta: IDelta): Promise<void> {
    try {
      // Дополнительная проверка релевантности через маппер
      if (!this.mapper.isRelevantDelta(delta)) {
        this.logger.debug(`Delta is not relevant for projects: contract=${delta.code}, table=${delta.table}`);
        return;
      }

      this.logger.debug(
        `Received project delta for key ${delta.primary_key} at block ${delta.block_num} from ${delta.code}::${delta.table}`
      );

      const result = await this.processDelta(delta);

      if (result) {
        const action = result.created ? 'created' : result.updated ? 'updated' : 'processed';
        this.logger.log(
          `Project ${result.entityId} ${action} at block ${result.blockNum} from ${delta.code}::${delta.table}`
        );
      }
    } catch (error: any) {
      this.logger.error(`Error handling project delta: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Обработка форков для проектов
   * Теперь подписывается на все форки независимо от контракта
   */
  @OnEvent('fork::*')
  async handleProjectFork(forkData: { block_num: number }): Promise<void> {
    try {
      this.logger.debug(`Handling fork for projects at block ${forkData.block_num}`);
      await this.handleFork(forkData.block_num);
    } catch (error: any) {
      this.logger.error(`Error handling project fork: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Дополнительные действия после обработки форка
   */
  protected async afterForkProcessing(forkBlockNum: number, affectedEntities: ProjectDomainEntity[]): Promise<void> {
    // Здесь можно добавить специфичную для проектов логику после форка
    // Например, очистка кеша, уведомления и т.д.

    if (affectedEntities.length > 0) {
      this.logger.log(`After project fork processing: ${affectedEntities.length} entities were affected`);

      // Можно добавить дополнительную логику:
      // - Очистка связанных данных (commits, results, etc.)
      // - Уведомления пользователей
      // - Обновление агрегированных данных
    }
  }
}
