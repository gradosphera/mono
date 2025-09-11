import { Injectable, Inject } from '@nestjs/common';
import { CapitalBlockchainPort, CAPITAL_BLOCKCHAIN_PORT } from '../interfaces/capital-blockchain.port';
import type { CreateProjectInvestDomainInput } from '../actions/create-project-invest-domain-input.interface';
import type { TransactResult } from '@wharfkit/session';
import { INVEST_REPOSITORY, InvestRepository } from '../repositories/invest.repository';
import { PROGRAM_INVEST_REPOSITORY, ProgramInvestRepository } from '../repositories/program-invest.repository';
import { InvestDomainEntity } from '../entities/invest.entity';
import { ProgramInvestDomainEntity } from '../entities/program-invest.entity';
import type { InvestFilterInputDTO } from '../../application/dto/invests_management/invest-filter.input';
import type {
  PaginationInputDomainInterface,
  PaginationResultDomainInterface,
} from '~/domain/common/interfaces/pagination.interface';
import { DomainToBlockchainUtils } from '~/shared/utils/domain-to-blockchain.utils';

/**
 * Интерактор домена для управления инвестициями CAPITAL контракта
 * Обрабатывает действия связанные с инвестициями в проекты
 */
@Injectable()
export class InvestsManagementInteractor {
  constructor(
    @Inject(CAPITAL_BLOCKCHAIN_PORT)
    private readonly capitalBlockchainPort: CapitalBlockchainPort,
    @Inject(INVEST_REPOSITORY)
    private readonly investRepository: InvestRepository,
    @Inject(PROGRAM_INVEST_REPOSITORY)
    private readonly programInvestRepository: ProgramInvestRepository,
    private readonly domainToBlockchainUtils: DomainToBlockchainUtils
  ) {}

  /**
   * Инвестирование в проект CAPITAL контракта
   */
  async createProjectInvest(data: CreateProjectInvestDomainInput): Promise<TransactResult> {
    // Преобразовываем доменный документ в формат блокчейна
    const blockchainData = {
      ...data,
      statement: this.domainToBlockchainUtils.convertSignedDocumentToBlockchainFormat(data.statement),
    };

    // Вызываем блокчейн порт
    return await this.capitalBlockchainPort.createProjectInvest(blockchainData);
  }

  // ============ МЕТОДЫ ЧТЕНИЯ ДАННЫХ ============

  /**
   * Получение всех инвестиций с фильтрацией и пагинацией
   */
  async getInvests(
    filter?: InvestFilterInputDTO,
    options?: PaginationInputDomainInterface
  ): Promise<PaginationResultDomainInterface<InvestDomainEntity>> {
    return await this.investRepository.findAllPaginated(filter, options);
  }

  /**
   * Получение всех программных инвестиций
   */
  async getProgramInvests(
    filter?: InvestFilterInputDTO,
    options?: PaginationInputDomainInterface
  ): Promise<PaginationResultDomainInterface<ProgramInvestDomainEntity>> {
    return await this.programInvestRepository.findAllPaginated(filter, options);
  }

  /**
   * Получение инвестиции по ID
   */
  async getInvestById(_id: string): Promise<InvestDomainEntity | null> {
    return await this.investRepository.findById(_id);
  }

  /**
   * Получение программной инвестиции по ID
   */
  async getProgramInvestById(_id: string): Promise<ProgramInvestDomainEntity | null> {
    return await this.programInvestRepository.findById(_id);
  }
}
