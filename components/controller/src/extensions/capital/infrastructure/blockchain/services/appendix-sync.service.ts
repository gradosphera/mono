import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import { OnEvent, EventEmitter2 } from '@nestjs/event-emitter';
import type { IDelta } from '~/types/common';
import { WinstonLoggerService } from '~/application/logger/logger-app.service';
import { AbstractEntitySyncService } from '../../../../../shared/services/abstract-entity-sync.service';
import { AppendixDomainEntity } from '../../../domain/entities/appendix.entity';
import { AppendixRepository, APPENDIX_REPOSITORY } from '../../../domain/repositories/appendix.repository';
import { AppendixDeltaMapper } from '../mappers/appendix-delta.mapper';
import type { IAppendixBlockchainData } from '../../../domain/interfaces/appendix-blockchain.interface';

/**
 * Сервис синхронизации приложений с блокчейном
 *
 * Подписывается на дельты таблицы appendixes контракта capital
 * и синхронизирует данные приложений в локальной базе данных
 */
@Injectable()
export class AppendixSyncService
  extends AbstractEntitySyncService<AppendixDomainEntity, IAppendixBlockchainData>
  implements OnModuleInit
{
  protected readonly entityName = 'Appendix';

  constructor(
    @Inject(APPENDIX_REPOSITORY)
    appendixRepository: AppendixRepository,
    appendixDeltaMapper: AppendixDeltaMapper,
    logger: WinstonLoggerService,
    private readonly eventEmitter: EventEmitter2
  ) {
    super(appendixRepository, appendixDeltaMapper, logger);
  }

  async onModuleInit() {
    const supportedVersions = this.getSupportedVersions();
    this.logger.log(
      `Appendix sync service initialized. Supporting contracts: [${supportedVersions.contracts.join(
        ', '
      )}], tables: [${supportedVersions.tables.join(', ')}]`
    );

    // Программная подписка на все поддерживаемые паттерны событий
    const allPatterns = this.getAllEventPatterns();
    this.logger.log(`Subscribing to ${allPatterns.length} event patterns: ${allPatterns.join(', ')}`);

    // Подписываемся на каждый паттерн программно
    allPatterns.forEach((pattern) => {
      this.eventEmitter.on(pattern, this.handleAppendixDelta.bind(this));
    });
  }

  /**
   * Обработчик дельт приложений
   */
  @OnEvent('capital::delta::appendixes')
  async handleAppendixDelta(delta: IDelta): Promise<void> {
    await this.processDelta(delta);
  }

  /**
   * Обработчик форков для приложений
   */
  @OnEvent('capital::fork')
  async handleFork(blockNum: number): Promise<void> {
    await this.handleFork(blockNum);
  }

  /**
   * Получение поддерживаемых версий контрактов и таблиц
   */
  public getSupportedVersions(): { contracts: string[]; tables: string[] } {
    return {
      contracts: this.mapper.getSupportedContractNames(),
      tables: this.mapper.getSupportedTableNames(),
    };
  }

  /**
   * Получение всех паттернов событий для подписки
   */
  public getAllEventPatterns(): string[] {
    return this.mapper.getAllEventPatterns();
  }
}
