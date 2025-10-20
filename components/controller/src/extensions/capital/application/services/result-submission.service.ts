import { Injectable } from '@nestjs/common';
import { ResultSubmissionInteractor } from '../use-cases/result-submission.interactor';
import type { PushResultInputDTO } from '../dto/result_submission/push-result-input.dto';
import type { ConvertSegmentInputDTO } from '../dto/result_submission/convert-segment-input.dto';
import type { SignActAsContributorInputDTO } from '../dto/result_submission/sign-act-as-contributor-input.dto';
import type { SignActAsChairmanInputDTO } from '../dto/result_submission/sign-act-as-chairman-input.dto';
import { ResultOutputDTO } from '../dto/result_submission/result.dto';
import { ResultFilterInputDTO } from '../dto/result_submission/result-filter.input';
import { PaginationInputDTO, PaginationResult } from '~/application/common/dto/pagination.dto';
import type { PaginationInputDomainInterface } from '~/domain/common/interfaces/pagination.interface';
import { GenerateDocumentOptionsInputDTO } from '~/application/document/dto/generate-document-options-input.dto';
import { GeneratedDocumentDTO } from '~/application/document/dto/generated-document.dto';
import { GenerateDocumentInputDTO } from '~/application/document/dto/generate-document-input.dto';
import { DocumentDomainInteractor } from '~/domain/document/interactors/document.interactor';
import { Cooperative } from 'cooptypes';
import { generateRandomHash } from '~/utils/generate-hash.util';
import type { MonoAccountDomainInterface } from '~/domain/account/interfaces/mono-account-domain.interface';
import { SegmentOutputDTO } from '../dto/segments/segment.dto';
import { SegmentsService } from './segments.service';
import { SegmentMapper } from '../../infrastructure/mappers/segment.mapper';

/**
 * Сервис уровня приложения для подачи результатов в CAPITAL
 * Обрабатывает запросы от ResultSubmissionResolver
 */
@Injectable()
export class ResultSubmissionService {
  constructor(
    private readonly resultSubmissionInteractor: ResultSubmissionInteractor,
    private readonly documentDomainInteractor: DocumentDomainInteractor,
    private readonly segmentsService: SegmentsService,
    private readonly segmentMapper: SegmentMapper
  ) {}

  /**
   * Внесение результата в CAPITAL контракте
   */
  async pushResult(data: PushResultInputDTO): Promise<SegmentOutputDTO> {
    const result_hash = generateRandomHash();
    const segmentEntity = await this.resultSubmissionInteractor.pushResult({ ...data, result_hash });
    return await this.segmentMapper.toDTO(segmentEntity);
  }

  /**
   * Конвертация сегмента в CAPITAL контракте
   */
  async convertSegment(data: ConvertSegmentInputDTO): Promise<SegmentOutputDTO> {
    const segmentEntity = await this.resultSubmissionInteractor.convertSegment(data);
    return await this.segmentMapper.toDTO(segmentEntity);
  }

  // ============ МЕТОДЫ ЧТЕНИЯ ДАННЫХ ============

  /**
   * Получение всех результатов с фильтрацией
   */
  async getResults(filter?: ResultFilterInputDTO, options?: PaginationInputDTO): Promise<PaginationResult<ResultOutputDTO>> {
    // Конвертируем параметры пагинации в доменные
    const domainOptions: PaginationInputDomainInterface | undefined = options;

    // Получаем результат с пагинацией из домена
    const result = await this.resultSubmissionInteractor.getResults(filter, domainOptions);

    // Конвертируем результат в DTO
    return {
      items: result.items as ResultOutputDTO[],
      totalCount: result.totalCount,
      totalPages: result.totalPages,
      currentPage: result.currentPage,
    };
  }

  /**
   * Получение результата по ID
   */
  async getResultById(_id: string): Promise<ResultOutputDTO | null> {
    const result = await this.resultSubmissionInteractor.getResultById(_id);
    return result as ResultOutputDTO | null;
  }

  // ============ МЕТОДЫ ГЕНЕРАЦИИ ДОКУМЕНТОВ ============

  /**
   * Генерация заявления о вкладе результатов
   */
  async generateResultContributionStatement(
    data: GenerateDocumentInputDTO,
    options: GenerateDocumentOptionsInputDTO
  ): Promise<GeneratedDocumentDTO> {
    const document = await this.documentDomainInteractor.generateDocument({
      data: {
        ...data,
        registry_id: Cooperative.Registry.ResultContributionStatement.registry_id,
      },
      options,
    });
    return document as GeneratedDocumentDTO;
  }

  /**
   * Генерация решения о вкладе результатов
   */
  async generateResultContributionDecision(
    data: GenerateDocumentInputDTO,
    options: GenerateDocumentOptionsInputDTO
  ): Promise<GeneratedDocumentDTO> {
    const document = await this.documentDomainInteractor.generateDocument({
      data: {
        ...data,
        registry_id: Cooperative.Registry.ResultContributionDecision.registry_id,
      },
      options,
    });
    return document as GeneratedDocumentDTO;
  }

  /**
   * Генерация акта о вкладе результатов
   */
  async generateResultContributionAct(
    data: GenerateDocumentInputDTO,
    options: GenerateDocumentOptionsInputDTO
  ): Promise<GeneratedDocumentDTO> {
    const document = await this.documentDomainInteractor.generateDocument({
      data: {
        ...data,
        registry_id: Cooperative.Registry.ResultContributionAct.registry_id,
      },
      options,
    });
    return document as GeneratedDocumentDTO;
  }

  /**
   * Подписание акта вкладчиком CAPITAL контракта
   */
  async signActAsContributor(
    data: SignActAsContributorInputDTO,
    currentUser: MonoAccountDomainInterface
  ): Promise<SegmentOutputDTO> {
    const domainInput = {
      ...data,
      username: currentUser.username,
    };
    const segmentEntity = await this.resultSubmissionInteractor.signActAsContributor(domainInput);
    return await this.segmentMapper.toDTO(segmentEntity);
  }

  /**
   * Подписание акта председателем CAPITAL контракта
   */
  async signActAsChairman(
    data: SignActAsChairmanInputDTO,
    currentUser: MonoAccountDomainInterface
  ): Promise<SegmentOutputDTO> {
    const domainInput = {
      ...data,
      chairman: currentUser.username,
    };
    const segmentEntity = await this.resultSubmissionInteractor.signActAsChairman(domainInput);
    return await this.segmentMapper.toDTO(segmentEntity);
  }
}
