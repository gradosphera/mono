import { Injectable } from '@nestjs/common';
import { DocumentAggregationService } from '~/domain/document/services/document-aggregation.service';
import type { ContributorDomainEntity } from '../../domain/entities/contributor.entity';
import { ContributorOutputDTO } from '../dto/participation_management/contributor.dto';

/**
 * Сервис для маппинга доменных сущностей участников в DTO
 */
@Injectable()
export class ContributorMapperService {
  constructor(private readonly documentAggregationService: DocumentAggregationService) {}

  /**
   * Маппинг доменной сущности участника в DTO
   */
  async mapContributorToOutputDTO(contributor: ContributorDomainEntity): Promise<ContributorOutputDTO> {
    // Асинхронная обработка контракта с использованием DocumentAggregationService
    const contract = contributor.contract
      ? await this.documentAggregationService.buildDocumentAggregate(contributor.contract)
      : null;

    return {
      ...contributor,
      contract,
    };
  }
}
