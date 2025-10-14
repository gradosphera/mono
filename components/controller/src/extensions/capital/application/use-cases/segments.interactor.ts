import { Injectable, Inject } from '@nestjs/common';
import { SEGMENT_REPOSITORY, SegmentRepository } from '../../domain/repositories/segment.repository';
import { SegmentDomainEntity } from '../../domain/entities/segment.entity';
import type {
  PaginationInputDomainInterface,
  PaginationResultDomainInterface,
} from '~/domain/common/interfaces/pagination.interface';
import type { SegmentFilterInputDTO } from '../dto/segments/segment-filter.input';
import { WinstonLoggerService } from '~/application/logger/logger-app.service';
import { CapitalBlockchainPort, CAPITAL_BLOCKCHAIN_PORT } from '../../domain/interfaces/capital-blockchain.port';
import type { RefreshSegmentDomainInput } from '../../domain/actions/refresh-segment-domain-input.interface';
import type { TransactResult } from '@wharfkit/session';

/**
 * Интерактор домена для управления сегментами CAPITAL контракта
 * Обрабатывает запросы на чтение данных сегментов
 */
@Injectable()
export class SegmentsInteractor {
  constructor(
    @Inject(SEGMENT_REPOSITORY)
    private readonly segmentRepository: SegmentRepository,
    @Inject(CAPITAL_BLOCKCHAIN_PORT)
    private readonly capitalBlockchainPort: CapitalBlockchainPort,
    private readonly logger: WinstonLoggerService
  ) {
    this.logger.setContext(SegmentsInteractor.name);
  }

  /**
   * Получить все сегменты с пагинацией и фильтрацией
   */
  async getSegments(
    filter?: SegmentFilterInputDTO,
    options?: PaginationInputDomainInterface
  ): Promise<PaginationResultDomainInterface<SegmentDomainEntity>> {
    return await this.segmentRepository.findAllPaginated(filter, options);
  }

  /**
   * Получить один сегмент по фильтрам
   */
  async getSegment(filter?: SegmentFilterInputDTO): Promise<SegmentDomainEntity | null> {
    return await this.segmentRepository.findOne(filter);
  }

  /**
   * Обновление сегмента в CAPITAL контракте
   */
  async refreshSegment(data: RefreshSegmentDomainInput): Promise<SegmentDomainEntity | null> {
    // Вызываем блокчейн порт для обновления сегмента
    const transactResult = await this.capitalBlockchainPort.refreshSegment(data);

    // Синхронизируем сегмент с базой данных
    return await this.syncSegment(data.coopname, data.project_hash, data.username, transactResult);
  }

  /**
   * Синхронизация сегмента между блокчейном и базой данных
   */
  private async syncSegment(
    coopname: string,
    projectHash: string,
    username: string,
    transactResult: TransactResult
  ): Promise<SegmentDomainEntity | null> {
    // Извлекаем данные сегмента из блокчейна по комбинированному индексу
    const blockchainSegment = await this.capitalBlockchainPort.getSegmentByProjectUser(coopname, projectHash, username);

    if (!blockchainSegment) {
      this.logger.warn(`Не удалось получить данные сегмента ${projectHash}:${username} из блокчейна после транзакции`);
      return null;
    }

    // Синхронизируем сегмент (createIfNotExists сам разберется - создать новый или обновить существующий)
    const segmentEntity = await this.segmentRepository.createIfNotExists(
      blockchainSegment,
      Number(transactResult.transaction?.ref_block_num ?? 0),
      true
    );

    return segmentEntity;
  }
}
