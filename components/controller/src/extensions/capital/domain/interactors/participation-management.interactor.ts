import { Injectable, Inject } from '@nestjs/common';
import { CapitalBlockchainPort, CAPITAL_BLOCKCHAIN_PORT } from '../interfaces/capital-blockchain.port';
import type { ImportContributorDomainInput } from '../actions/import-contributor-domain-input.interface';
import type { RegisterContributorDomainInput } from '../actions/register-contributor-domain-input.interface';
import type { MakeClearanceDomainInput } from '../actions/make-clearance-domain-input.interface';
import type { TransactResult } from '@wharfkit/session';
import { CONTRIBUTOR_REPOSITORY, ContributorRepository } from '../repositories/contributor.repository';
import { ContributorDomainEntity } from '../entities/contributor.entity';
import type { ContributorFilterInputDTO } from '../../application/dto/participation_management/contributor-filter.input';
import type {
  PaginationInputDomainInterface,
  PaginationResultDomainInterface,
} from '~/domain/common/interfaces/pagination.interface';
import { DomainToBlockchainUtils } from '~/shared/utils/domain-to-blockchain.utils';

/**
 * Интерактор домена для управления участием в CAPITAL контракте
 * Обрабатывает действия связанные с вкладчиками и их регистрацией
 */
@Injectable()
export class ParticipationManagementInteractor {
  constructor(
    @Inject(CAPITAL_BLOCKCHAIN_PORT)
    private readonly capitalBlockchainPort: CapitalBlockchainPort,
    @Inject(CONTRIBUTOR_REPOSITORY)
    private readonly contributorRepository: ContributorRepository,
    private readonly domainToBlockchainUtils: DomainToBlockchainUtils
  ) {}

  /**
   * Импорт вкладчика в CAPITAL контракт
   */
  async importContributor(data: ImportContributorDomainInput): Promise<TransactResult> {
    // Вызываем блокчейн порт
    return await this.capitalBlockchainPort.importContributor(data);
  }

  /**
   * Регистрация вкладчика в CAPITAL контракте
   */
  async registerContributor(data: RegisterContributorDomainInput): Promise<TransactResult> {
    // Преобразовываем доменный документ в формат блокчейна
    const blockchainData = {
      ...data,
      contract: this.domainToBlockchainUtils.convertSignedDocumentToBlockchainFormat(data.contract),
    };

    // Вызываем блокчейн порт
    return await this.capitalBlockchainPort.registerContributor(blockchainData);
  }

  /**
   * Подписание приложения в CAPITAL контракте
   */
  async makeClearance(data: MakeClearanceDomainInput): Promise<TransactResult> {
    // Преобразовываем доменный документ в формат блокчейна
    const blockchainData = {
      ...data,
      document: this.domainToBlockchainUtils.convertSignedDocumentToBlockchainFormat(data.document),
    };

    // Вызываем блокчейн порт
    return await this.capitalBlockchainPort.makeClearance(blockchainData);
  }

  // ============ МЕТОДЫ ЧТЕНИЯ ДАННЫХ ============

  /**
   * Получение всех вкладчиков с фильтрацией и пагинацией
   */
  async getContributors(
    filter?: ContributorFilterInputDTO,
    options?: PaginationInputDomainInterface
  ): Promise<PaginationResultDomainInterface<ContributorDomainEntity>> {
    return await this.contributorRepository.findAllPaginated(filter, options);
  }

  /**
   * Получение вкладчика по ID
   */
  async getContributorById(_id: string): Promise<ContributorDomainEntity | null> {
    return await this.contributorRepository.findById(_id);
  }
}
