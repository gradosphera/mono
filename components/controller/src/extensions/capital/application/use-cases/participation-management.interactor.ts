import { Injectable, Inject } from '@nestjs/common';
import { CapitalBlockchainPort, CAPITAL_BLOCKCHAIN_PORT } from '../../domain/interfaces/capital-blockchain.port';
import type { ImportContributorDomainInput } from '../../domain/actions/import-contributor-domain-input.interface';
import type { RegisterContributorDomainInput } from '../../domain/actions/register-contributor-domain-input.interface';
import type { EditContributorDomainInput } from '../../domain/actions/edit-contributor-domain-input.interface';
import type { MakeClearanceDomainInput } from '../../domain/actions/make-clearance-domain-input.interface';
import type { IAppendixDatabaseData } from '../../domain/interfaces/appendix-database.interface';
import type { TransactResult } from '@wharfkit/session';
import { CONTRIBUTOR_REPOSITORY, ContributorRepository } from '../../domain/repositories/contributor.repository';
import { APPENDIX_REPOSITORY, AppendixRepository } from '../../domain/repositories/appendix.repository';
import { ContributorDomainEntity } from '../../domain/entities/contributor.entity';
import { AppendixDomainEntity } from '../../domain/entities/appendix.entity';
import { ContributorStatus } from '../../domain/enums/contributor-status.enum';
import { AppendixStatus } from '../../domain/enums/appendix-status.enum';
import type { ContributorFilterInputDTO } from '../dto/participation_management/contributor-filter.input';
import type {
  PaginationInputDomainInterface,
  PaginationResultDomainInterface,
} from '~/domain/common/interfaces/pagination.interface';
import { DomainToBlockchainUtils } from '~/shared/utils/domain-to-blockchain.utils';
import { AccountDataPort, ACCOUNT_DATA_PORT } from '~/domain/account/ports/account-data.port';
import { generateRandomHash } from '~/utils/generate-hash.util';
import { config } from '~/config';
import { HttpApiError } from '~/utils/httpApiError';
import httpStatus from 'http-status';
import { DocumentInteractor } from '~/application/document/interactors/document.interactor';

/**
 * Интерактор домена для управления участием в CAPITAL контракте
 * Обрабатывает действия связанные с участниками и их регистрацией
 */
@Injectable()
export class ParticipationManagementInteractor {
  constructor(
    @Inject(CAPITAL_BLOCKCHAIN_PORT)
    private readonly capitalBlockchainPort: CapitalBlockchainPort,
    @Inject(CONTRIBUTOR_REPOSITORY)
    private readonly contributorRepository: ContributorRepository,
    @Inject(APPENDIX_REPOSITORY)
    private readonly appendixRepository: AppendixRepository,
    @Inject(ACCOUNT_DATA_PORT)
    private readonly accountDataPort: AccountDataPort,
    private readonly domainToBlockchainUtils: DomainToBlockchainUtils,
    private readonly documentInteractor: DocumentInteractor
  ) {}

  /**
   * Получение отображаемого имени из аккаунта через порт расширения
   */
  private async getDisplayNameFromAccount(username: string): Promise<string> {
    return await this.accountDataPort.getDisplayName(username);
  }

  /**
   * Импорт участника в CAPITAL контракт
   */
  async importContributor(data: ImportContributorDomainInput): Promise<TransactResult> {
    // Получаем отображаемое имя из аккаунта
    const displayName = await this.getDisplayNameFromAccount(data.username);

    // Создаем участника в репозитории (данные базы данных)
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
   * Регистрация участника в CAPITAL контракте
   */
  async registerContributor(data: RegisterContributorDomainInput): Promise<TransactResult> {
    // Извлекаем документ из базы данных для верификации
    const document = await this.documentInteractor.getDocumentByHash(data.contract.doc_hash);

    if (!document) {
      throw new HttpApiError(httpStatus.BAD_REQUEST, `Документ с хэшем ${data.contract.doc_hash} не найден`);
    }

    // Проверяем, что username в документе совпадает с переданным
    if (document.meta.username !== data.username) {
      throw new HttpApiError(
        httpStatus.BAD_REQUEST,
        `Username в документе (${document.meta.username}) не совпадает с переданным (${data.username})`
      );
    }

    // Проверяем, что contributor_hash в документе совпадает с переданным
    if (document.meta.contributor_hash !== data.contributor_hash) {
      throw new HttpApiError(
        httpStatus.BAD_REQUEST,
        `Contributor hash в документе (${document.meta.contributor_hash}) не совпадает с переданным (${data.contributor_hash})`
      );
    }

    // Получаем отображаемое имя из аккаунта
    const displayName = await this.getDisplayNameFromAccount(data.username);

    // Используем contributor_hash из документа
    const databaseData = {
      _id: '', // будет сгенерирован автоматически
      block_num: 0,
      present: false,
      contributor_hash: data.contributor_hash,
      status: ContributorStatus.PENDING,
      about: data.about ?? '',
      _created_at: new Date(),
      _updated_at: new Date(),
      display_name: displayName,
    };

    // Преобразовываем доменный документ в формат блокчейна
    const blockchainAction = {
      ...data,
      contributor_hash: data.contributor_hash,
      rate_per_hour: data.rate_per_hour ?? '0.0000 ' + config.blockchain.root_govern_symbol,
      hours_per_day: data.hours_per_day ?? 0,
      is_external_contract: false,
      contract: this.domainToBlockchainUtils.convertSignedDocumentToBlockchainFormat(data.contract),
    };

    // Вызываем блокчейн порт для регистрации - получаем транзакцию
    const result = await this.capitalBlockchainPort.registerContributor(blockchainAction);

    // Получаем данные участника из блокчейна после регистрации
    const blockchainData = await this.capitalBlockchainPort.getContributor(data.coopname, data.username);

    if (!blockchainData) {
      throw new HttpApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        `Не удалось получить данные участника ${databaseData.contributor_hash} из блокчейна после регистрации`
      );
    }

    // Создаем полный объект участника, объединяя данные базы и блокчейна
    const fullContributor = new ContributorDomainEntity(databaseData, blockchainData);

    // Сохраняем полный объект в репозиторий
    await this.contributorRepository.create(fullContributor);

    return result;
  }

  /**
   * Подписание приложения в CAPITAL контракте
   */
  async makeClearance(data: MakeClearanceDomainInput): Promise<TransactResult> {
    // Проверяем, есть ли уже запрос на рассмотрении для данного пользователя и проекта
    const existingAppendix = await this.appendixRepository.findCreatedByUsernameAndProjectHash(
      data.username,
      data.project_hash
    );

    if (existingAppendix) {
      throw new HttpApiError(httpStatus.CONFLICT, 'Подождите, ваш запрос на рассмотрении');
    }

    // Создаем базовые данные appendix для базы данных
    const databaseData: IAppendixDatabaseData = {
      _id: '',
      block_num: undefined,
      present: false, // Важно: изначально present = false
      appendix_hash: generateRandomHash(),
      status: AppendixStatus.CREATED,
      blockchain_status: undefined,
      contribution: data.contribution,
      _created_at: new Date(),
      _updated_at: new Date(),
    };

    // ШАГ 1: Частичное сохранение в базу данных
    const partialAppendix = new AppendixDomainEntity(databaseData);
    const savedAppendix = await this.appendixRepository.save(partialAppendix);

    // ШАГ 2: Вызываем блокчейн порт для makeClearance
    const result = await this.capitalBlockchainPort.makeClearance({
      coopname: data.coopname,
      username: data.username,
      project_hash: data.project_hash,
      appendix_hash: partialAppendix.appendix_hash,
      document: this.domainToBlockchainUtils.convertSignedDocumentToBlockchainFormat(data.document),
    });

    // ШАГ 3: Получаем данные appendix из блокчейна после makeClearance
    const blockchainData = await this.capitalBlockchainPort.getAppendix(data.coopname, partialAppendix.appendix_hash);

    if (!blockchainData) {
      throw new HttpApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        `Не удалось получить данные appendix ${partialAppendix.appendix_hash} из блокчейна после makeClearance`
      );
    }
    // ШАГ 4: Обновляем существующую запись полными данными
    savedAppendix.updateFromBlockchain(blockchainData, Number(result.transaction?.ref_block_num) ?? 0, true);
    await this.appendixRepository.save(savedAppendix);

    return result;
  }

  /**
   * Редактирование участника в CAPITAL контракте
   */
  async editContributor(data: EditContributorDomainInput): Promise<TransactResult> {
    // Находим участника в базе данных для обновления поля about
    const contributor = await this.getContributorByCriteria({
      username: data.username,
    });

    if (!contributor) {
      throw new HttpApiError(httpStatus.NOT_FOUND, `Участник ${data.username} не найден в кооперативе ${data.coopname}`);
    }

    // Обновляем поле about в базе данных, если оно передано
    if (data.about !== undefined) {
      contributor.about = data.about;
      await this.contributorRepository.update(contributor);
    }

    // Отправляем в блокчейн только параметры для редактирования (rate_per_hour и hours_per_day)
    const blockchainData = {
      coopname: data.coopname,
      username: data.username,
      rate_per_hour: data.rate_per_hour ?? '0.0000 ' + config.blockchain.root_govern_symbol,
      hours_per_day: data.hours_per_day ?? 0,
    };

    // Вызываем блокчейн порт для редактирования участника
    const result = await this.capitalBlockchainPort.editContributor(blockchainData);

    // Синхронизация автоматически обновит данные из блокчейна
    return result;
  }

  // ============ МЕТОДЫ ЧТЕНИЯ ДАННЫХ ============

  /**
   * Получение всех участников с фильтрацией и пагинацией
   */
  async getContributors(
    filter?: ContributorFilterInputDTO,
    options?: PaginationInputDomainInterface
  ): Promise<PaginationResultDomainInterface<ContributorDomainEntity>> {
    return await this.contributorRepository.findAllPaginated(filter, options);
  }

  /**
   * Получение участника по ID
   */
  async getContributorById(_id: string): Promise<ContributorDomainEntity | null> {
    return await this.contributorRepository.findById(_id);
  }

  /**
   * Получение участника по критериям поиска
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
