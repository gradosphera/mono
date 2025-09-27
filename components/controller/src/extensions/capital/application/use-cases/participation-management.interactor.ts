import { Injectable, Inject } from '@nestjs/common';
import { CapitalBlockchainPort, CAPITAL_BLOCKCHAIN_PORT } from '../../domain/interfaces/capital-blockchain.port';
import type { ImportContributorDomainInput } from '../../domain/actions/import-contributor-domain-input.interface';
import type { RegisterContributorDomainInput } from '../../domain/actions/register-contributor-domain-input.interface';
import type { MakeClearanceDomainInput } from '../../domain/actions/make-clearance-domain-input.interface';
import type { TransactResult } from '@wharfkit/session';
import { CONTRIBUTOR_REPOSITORY, ContributorRepository } from '../../domain/repositories/contributor.repository';
import { ContributorDomainEntity } from '../../domain/entities/contributor.entity';
import { ContributorStatus } from '../../domain/enums/contributor-status.enum';
import type { ContributorFilterInputDTO } from '../dto/participation_management/contributor-filter.input';
import type {
  PaginationInputDomainInterface,
  PaginationResultDomainInterface,
} from '~/domain/common/interfaces/pagination.interface';
import { DomainToBlockchainUtils } from '~/shared/utils/domain-to-blockchain.utils';
import { AccountExtensionPort, ACCOUNT_EXTENSION_PORT } from '~/domain/extension/ports/account-extension-port';
import { generateRandomHash } from '~/utils/generate-hash.util';
import { config } from '~/config';
import { HttpApiError } from '~/errors/http-api-error';
import httpStatus from 'http-status';

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
    @Inject(ACCOUNT_EXTENSION_PORT)
    private readonly accountExtensionPort: AccountExtensionPort,
    private readonly domainToBlockchainUtils: DomainToBlockchainUtils
  ) {}

  /**
   * Получение отображаемого имени из аккаунта через порт расширения
   */
  private async getDisplayNameFromAccount(username: string): Promise<string> {
    return await this.accountExtensionPort.getDisplayName(username);
  }

  /**
   * Импорт вкладчика в CAPITAL контракт
   */
  async importContributor(data: ImportContributorDomainInput): Promise<TransactResult> {
    // Получаем отображаемое имя из аккаунта
    const displayName = await this.getDisplayNameFromAccount(data.username);

    // Создаем вкладчика в репозитории (данные базы данных)
    const contributor = new ContributorDomainEntity({
      _id: '', // будет сгенерирован автоматически
      block_num: 0,
      present: true,
      contributor_hash: data.contributor_hash,
      status: ContributorStatus.PENDING,
      _created_at: new Date(),
      _updated_at: new Date(),
      display_name: displayName,
    });

    // Вызываем блокчейн порт
    const result = await this.capitalBlockchainPort.importContributor(data);

    await this.contributorRepository.create(contributor);

    // Синхронизация автоматически обновит данные из блокчейна
    return result;
  }

  /**
   * Регистрация вкладчика в CAPITAL контракте
   */
  async registerContributor(data: RegisterContributorDomainInput): Promise<TransactResult> {
    // Получаем отображаемое имя из аккаунта
    const displayName = await this.getDisplayNameFromAccount(data.username);

    // Создаем базовые данные вкладчика для базы данных
    const databaseData = {
      _id: '', // будет сгенерирован автоматически
      block_num: 0,
      present: false,
      contributor_hash: generateRandomHash(),
      status: ContributorStatus.PENDING,
      about: data.about ?? '',
      _created_at: new Date(),
      _updated_at: new Date(),
      display_name: displayName,
    };

    // Преобразовываем доменный документ в формат блокчейна
    const blockchainAction = {
      ...data,
      contributor_hash: databaseData.contributor_hash,
      rate_per_hour: data.rate_per_hour ?? config.blockchain.root_govern_symbol,
      is_external_contract: false,
      contract: this.domainToBlockchainUtils.convertSignedDocumentToBlockchainFormat(data.contract),
    };

    // Вызываем блокчейн порт для регистрации - получаем транзакцию
    const result = await this.capitalBlockchainPort.registerContributor(blockchainAction);

    // Получаем данные вкладчика из блокчейна после регистрации
    const blockchainData = await this.capitalBlockchainPort.getContributor(data.coopname, databaseData.contributor_hash);

    if (!blockchainData) {
      throw new HttpApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        `Не удалось получить данные вкладчика ${databaseData.contributor_hash} из блокчейна после регистрации`
      );
    }

    // Создаем полный объект вкладчика, объединяя данные базы и блокчейна
    const fullContributor = new ContributorDomainEntity(databaseData, blockchainData);

    // Сохраняем полный объект в репозиторий
    await this.contributorRepository.create(fullContributor);

    return result;
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

  /**
   * Получение вкладчика по критериям поиска
   * Ищет по _id, username или contributor_hash
   */
  async getContributorByCriteria(criteria: {
    _id?: string;
    username?: string;
    contributor_hash?: string;
  }): Promise<ContributorDomainEntity | null> {
    return await this.contributorRepository.findOne(criteria);
  }
}
