import { Injectable, Inject } from '@nestjs/common';
import { CapitalBlockchainPort, CAPITAL_BLOCKCHAIN_PORT } from '../../domain/interfaces/capital-blockchain.port';
import type { TransactResult } from '@wharfkit/session';
import type { PushResultDomainInput } from '../../domain/actions/push-result-domain-input.interface';
import type { ConvertSegmentDomainInput } from '../../domain/actions/convert-segment-domain-input.interface';
import { RESULT_REPOSITORY, ResultRepository } from '../../domain/repositories/result.repository';
import { ResultDomainEntity } from '../../domain/entities/result.entity';
import type { ResultFilterInputDTO } from '../dto/result_submission/result-filter.input';
import type {
  PaginationInputDomainInterface,
  PaginationResultDomainInterface,
} from '~/domain/common/interfaces/pagination.interface';
import { DomainToBlockchainUtils } from '~/shared/utils/domain-to-blockchain.utils';

/**
 * Интерактор домена для подведения результатов в CAPITAL контракте
 * Обрабатывает действия связанные с внесением результатов и конвертацией сегментов
 */
@Injectable()
export class ResultSubmissionInteractor {
  constructor(
    @Inject(CAPITAL_BLOCKCHAIN_PORT)
    private readonly capitalBlockchainPort: CapitalBlockchainPort,
    @Inject(RESULT_REPOSITORY)
    private readonly resultRepository: ResultRepository,
    private readonly domainToBlockchainUtils: DomainToBlockchainUtils
  ) {}

  /**
   * Внесение результата в CAPITAL контракте
   */
  async pushResult(data: PushResultDomainInput): Promise<TransactResult> {
    // Вызываем блокчейн порт
    // Преобразовываем доменный документ в формат блокчейна
    const blockchainData = {
      ...data,
      statement: this.domainToBlockchainUtils.convertSignedDocumentToBlockchainFormat(data.statement),
    };

    return await this.capitalBlockchainPort.pushResult(blockchainData);
  }

  /**
   * Конвертация сегмента в CAPITAL контракте
   */
  async convertSegment(data: ConvertSegmentDomainInput): Promise<TransactResult> {
    // Преобразовываем доменный документ в формат блокчейна
    const blockchainData = {
      ...data,
      convert_statement: this.domainToBlockchainUtils.convertSignedDocumentToBlockchainFormat(data.convert_statement),
    };

    // Вызываем блокчейн порт
    return await this.capitalBlockchainPort.convertSegment(blockchainData);
  }

  // ============ МЕТОДЫ ЧТЕНИЯ ДАННЫХ ============

  /**
   * Получение всех результатов с фильтрацией и пагинацией
   */
  async getResults(
    filter?: ResultFilterInputDTO,
    options?: PaginationInputDomainInterface
  ): Promise<PaginationResultDomainInterface<ResultDomainEntity>> {
    return await this.resultRepository.findAllPaginated(filter, options);
  }

  /**
   * Получение результата по ID
   */
  async getResultById(_id: string): Promise<ResultDomainEntity | null> {
    return await this.resultRepository.findById(_id);
  }
}
