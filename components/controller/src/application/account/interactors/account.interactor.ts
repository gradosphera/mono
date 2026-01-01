import { AccountDomainEntity } from '~/domain/account/entities/account-domain.entity';
import config from '~/config/config';
import { AccountDomainService } from '~/domain/account/services/account-domain.service';
import { Inject, Injectable, Logger, HttpStatus } from '@nestjs/common';
import { HttpApiError } from '~/utils/httpApiError';
import { UserDomainService, USER_DOMAIN_SERVICE } from '~/domain/user/services/user-domain.service';
import { TokenApplicationService } from '~/application/token/services/token-application.service';
import { GENERATOR_PORT, GeneratorPort } from '~/domain/document/ports/generator.port';
import {
  NOTIFICATION_DOMAIN_SERVICE,
  NotificationDomainService,
} from '~/domain/notification/services/notification-domain.service';
import { EventsService } from '~/infrastructure/events/events.service';
import type { GetAccountsInputDomainInterface } from '~/domain/account/interfaces/get-accounts-input.interface';
import type {
  PaginationInputDomainInterface,
  PaginationResultDomainInterface,
} from '~/domain/common/interfaces/pagination.interface';
import type { RegisterAccountDomainInterface } from '~/domain/account/interfaces/register-account-input.interface';
import type { RegisteredAccountDomainInterface } from '~/domain/account/interfaces/registeted-account.interface';
import type { UpdateAccountDomainInterface } from '~/domain/account/interfaces/update-account-input.interface';
import { AccountType } from '~/application/account/enum/account-type.enum';
import httpStatus from 'http-status';
import { USER_REPOSITORY, UserRepository } from '~/domain/user/repositories/user.repository';
import { randomUUID } from 'crypto';
import type { Cooperative } from 'cooptypes';
import { ORGANIZATION_REPOSITORY, OrganizationRepository } from '~/domain/common/repositories/organization.repository';
import { INDIVIDUAL_REPOSITORY, IndividualRepository } from '~/domain/common/repositories/individual.repository';
import { ENTREPRENEUR_REPOSITORY, EntrepreneurRepository } from '~/domain/common/repositories/entrepreneur.repository';
import {
  SEARCH_PRIVATE_ACCOUNTS_REPOSITORY,
  SearchPrivateAccountsRepository,
} from '~/domain/common/repositories/search-private-accounts.repository';
import { IndividualDomainEntity } from '~/domain/branch/entities/individual-domain.entity';
import { OrganizationDomainEntity } from '~/domain/branch/entities/organization-domain.entity';
import { EntrepreneurDomainEntity } from '~/domain/branch/entities/entrepreneur-domain.entity';
import { ACCOUNT_BLOCKCHAIN_PORT, AccountBlockchainPort } from '~/domain/account/interfaces/account-blockchain.port';
import { CANDIDATE_REPOSITORY, CandidateRepository } from '~/domain/account/repository/candidate.repository';
import { userStatus } from '~/types/user.types';
import { sha256 } from '~/utils/sha256';
import type {
  SearchPrivateAccountsInputDomainInterface,
  PrivateAccountSearchResultDomainInterface,
} from '~/domain/common/interfaces/search-private-accounts-domain.interface';

@Injectable()
export class AccountInteractor {
  constructor(
    private readonly accountDomainService: AccountDomainService,
    @Inject(ORGANIZATION_REPOSITORY) private readonly organizationRepository: OrganizationRepository,
    @Inject(INDIVIDUAL_REPOSITORY) private readonly individualRepository: IndividualRepository,
    @Inject(ENTREPRENEUR_REPOSITORY) private readonly entrepreneurRepository: EntrepreneurRepository,
    @Inject(SEARCH_PRIVATE_ACCOUNTS_REPOSITORY)
    private readonly searchPrivateAccountsRepository: SearchPrivateAccountsRepository,
    @Inject(ACCOUNT_BLOCKCHAIN_PORT) private readonly accountBlockchainPort: AccountBlockchainPort,
    @Inject(CANDIDATE_REPOSITORY) private readonly candidateRepository: CandidateRepository,
    @Inject(NOTIFICATION_DOMAIN_SERVICE) private readonly notificationDomainService: NotificationDomainService,
    private readonly eventsService: EventsService,
    @Inject(GENERATOR_PORT) private readonly generatorPort: GeneratorPort,
    private readonly tokenApplicationService: TokenApplicationService,
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    @Inject(USER_DOMAIN_SERVICE) private readonly userDomainService: UserDomainService
  ) {}

  private readonly logger = new Logger(AccountInteractor.name);

  /**
   * Создает пользователя с соответствующими данными в генераторе документов
   */
  private async createUser(userBody: any) {
    // Проверяем на существование пользователя
    // допускаем обновление личных данных, если пользователь находится в статусе 'created'
    const exist = await this.userRepository.findByEmail(userBody.email);

    if (exist && exist.status !== 'created') {
      if (await this.userRepository.isEmailTaken(userBody.email)) {
        throw new HttpApiError(httpStatus.BAD_REQUEST, 'Пользователь с указанным EMAIL уже зарегистрирован');
      }
    }

    // Валидация входных данных
    if (userBody.type === 'individual') {
      if (!userBody.individual_data) throw new HttpApiError(httpStatus.BAD_REQUEST, 'Individual data is required');
      else userBody.individual_data.email = userBody.email;
    }

    if (userBody.type === 'organization') {
      if (!userBody.organization_data) throw new HttpApiError(httpStatus.BAD_REQUEST, 'Organization data is required');
      else userBody.organization_data.email = userBody.email;
    }

    if (userBody.type === 'entrepreneur') {
      if (!userBody.entrepreneur_data) throw new HttpApiError(httpStatus.BAD_REQUEST, 'Entrepreneur data is required');
      else userBody.entrepreneur_data.email = userBody.email;
    }

    // Сохраняем данные в соответствующие коллекции генератора
    if (userBody.type === 'individual' && userBody.individual_data) {
      await this.generatorPort.save('individual', { username: userBody.username, ...userBody.individual_data });
    }

    if (userBody.type === 'organization' && userBody.organization_data) {
      const { bank_account, ...userData } = userBody.organization_data || {};

      const paymentMethod: Cooperative.Payments.IPaymentData = {
        username: userBody.username,
        method_id: randomUUID(),
        method_type: 'bank_transfer',
        is_default: true,
        data: bank_account,
      };

      await this.generatorPort.save('organization', { username: userBody.username, ...userData });
      await this.generatorPort.save('paymentMethod', paymentMethod);
    }

    if (userBody.type === 'entrepreneur' && userBody.entrepreneur_data) {
      const { bank_account, ...userData } = userBody.entrepreneur_data || {};

      const paymentMethod: Cooperative.Payments.IPaymentData = {
        username: userBody.username,
        method_id: randomUUID(),
        method_type: 'bank_transfer',
        is_default: true,
        data: bank_account,
      };

      await this.generatorPort.save('entrepreneur', { username: userBody.username, ...userData });
      await this.generatorPort.save('paymentMethod', paymentMethod);
    }

    // Создаем или обновляем пользователя
    if (exist) {
      const updatedUser = await this.userRepository.updateByUsername(exist.username, userBody);
      if (!updatedUser) throw new HttpApiError(httpStatus.NOT_FOUND, 'Пользователь не найден');
      return updatedUser;
    } else {
      return await this.userRepository.create(userBody);
    }
  }

  async updateAccount(data: UpdateAccountDomainInterface): Promise<AccountDomainEntity> {
    this.logger.log(`Начало обновления аккаунта ${data.username}`);

    let user;
    if (data.individual_data) {
      const email = data.individual_data.email;
      user = await this.userRepository.updateByUsername(data.username, { email });
      if (!user) throw new HttpApiError(httpStatus.NOT_FOUND, 'Пользователь не найден');
      this.individualRepository.create({ ...data.individual_data, username: data.username });
    } else if (data.organization_data) {
      const email = data.organization_data.email;
      user = await this.userRepository.updateByUsername(data.username, { email });
      if (!user) throw new HttpApiError(httpStatus.NOT_FOUND, 'Пользователь не найден');
      this.organizationRepository.create({ ...data.organization_data, username: data.username });
    } else if (data.entrepreneur_data) {
      const email = data.entrepreneur_data.email;
      user = await this.userRepository.updateByUsername(data.username, { email });
      if (!user) throw new HttpApiError(httpStatus.NOT_FOUND, 'Пользователь не найден');
      this.entrepreneurRepository.create({ ...data.entrepreneur_data, username: data.username });
    } else {
      throw new Error('Не получены входные данные для обновления');
    }

    // Обновляем подписчика NOVU с новыми данными
    try {
      const account = await this.getAccount(user.username);
      await this.notificationDomainService.createSubscriberFromAccount(account);
      this.logger.log(`Подписчик NOVU обновлен для ${data.username}`);
    } catch (error: any) {
      this.logger.error(`Ошибка обновления подписчика NOVU для ${data.username}: ${error.message}`, error.stack);
    }

    // Получаем финальный аккаунт
    const account = await this.getAccount(user.username);

    this.logger.log(`Успешно обновлен аккаунт ${data.username}`);

    // Эмитим событие об обновлении аккаунта для синхронизации с участниками
    this.eventsService.emit('account::updated', {
      username: data.username,
      account,
    });

    const result = new AccountDomainEntity(account);
    return result;
  }

  async deleteAccount(username: string): Promise<void> {
    await this.userDomainService.deleteUserByUsername(username);
  }

  async getUserProfile(
    username: string,
    accountType: AccountType
  ): Promise<IndividualDomainEntity | OrganizationDomainEntity | EntrepreneurDomainEntity> {
    switch (accountType) {
      case AccountType.individual:
        return new IndividualDomainEntity(await this.individualRepository.findByUsername(username));
      case AccountType.organization:
        return new OrganizationDomainEntity(await this.organizationRepository.findByUsername(username));
      case AccountType.entrepreneur:
        return new EntrepreneurDomainEntity(await this.entrepreneurRepository.findByUsername(username));
      default:
        throw new Error(`Неизвестный тип аккаунта: ${accountType}`);
    }
  }

  async registerAccount(data: RegisterAccountDomainInterface): Promise<RegisteredAccountDomainInterface> {
    //TODO refactor after migrate from mongo
    const user = await this.createUser({ ...data, role: 'user' });
    const tokens = await this.tokenApplicationService.generateAuthTokens(user.id);

    // Настраиваем подписчика NOVU
    try {
      await this.accountDomainService.setupNotificationSubscriber(user.username, 'регистрации');
    } catch (error: any) {
      this.logger.error(`Ошибка настройки подписчика NOVU при регистрации ${data.username}: ${error.message}`, error.stack);
    }

    // Создаем нового кандидата в репозитории
    const now = new Date();
    await this.candidateRepository.create({
      username: data.username,
      coopname: config.coopname,
      braname: '', // Может быть задано позже
      status: 'pending', // Начальный статус
      type: data.type, // Используем тип из входных данных
      created_at: now,
      documents: {
        statement: undefined, // Документы будут добавлены позже
        wallet_agreement: undefined,
        signature_agreement: undefined,
        privacy_agreement: undefined,
        user_agreement: undefined,
      },
      referer: data.referer,
      public_key: data.public_key,
      meta: JSON.stringify({}),
      registration_hash: sha256(data.username), // Будет установлен при обработке платежа
    });

    this.logger.log(`Создан новый кандидат: ${data.username}, тип: ${data.type}`);

    const account = await this.getAccount(data.username);

    const result: RegisteredAccountDomainInterface = {
      account,
      tokens,
    };

    return result;
  }

  async getAccount(username: string): Promise<AccountDomainEntity> {
    return await this.accountDomainService.getAccount(username);
  }

  async getAccounts(
    data: GetAccountsInputDomainInterface = {},
    options: PaginationInputDomainInterface = { page: 1, limit: 10, sortOrder: 'DESC' }
  ): Promise<PaginationResultDomainInterface<AccountDomainEntity>> {
    const provider_accounts = await this.userRepository.findAllPaginated(data, options);

    const result: PaginationResultDomainInterface<AccountDomainEntity> = {
      items: [],
      totalCount: provider_accounts.totalCount,
      totalPages: provider_accounts.totalPages,
      currentPage: provider_accounts.currentPage,
    };

    for (const account of provider_accounts.items) {
      const item = await this.accountDomainService.getAccount(account.username);
      result.items.push(item);
    }

    return result;
  }

  /**
   * Регистрирует аккаунт в блокчейне.
   * @param username - Имя пользователя
   */
  async registerBlockchainAccount(username: string): Promise<void> {
    this.logger.log(`Начало регистрации аккаунта ${username} в блокчейне`);

    // Получаем кандидата из репозитория
    const candidate = await this.candidateRepository.findByUsername(username);
    if (!candidate) {
      throw new HttpApiError(HttpStatus.NOT_FOUND, `Кандидат с именем ${username} не найден`);
    }

    try {
      // Вызываем порт для регистрации в блокчейне, передавая объект кандидата целиком
      await this.accountBlockchainPort.registerBlockchainAccount(candidate);

      // Обновляем статус пользователя
      await this.userDomainService.updateUserByUsername(username, {
        status: userStatus['4_Registered'],
        is_registered: true,
        has_account: true,
      });

      this.logger.log(`Успешная регистрация аккаунта ${username} в блокчейне`);
    } catch (error: any) {
      this.logger.error(`Ошибка при регистрации аккаунта ${username} в блокчейне: ${error.message}`, error.stack);
      throw new HttpApiError(HttpStatus.INTERNAL_SERVER_ERROR, `Ошибка при регистрации в блокчейне: ${error.message}`);
    }
  }

  /**
   * Поиск приватных аккаунтов по запросу
   * @param input Входные данные для поиска
   * @returns Массив результатов поиска
   */
  async searchPrivateAccounts(
    input: SearchPrivateAccountsInputDomainInterface
  ): Promise<PrivateAccountSearchResultDomainInterface[]> {
    this.logger.log(`Поиск приватных аккаунтов по запросу: "${input.query}"`);

    const results = await this.searchPrivateAccountsRepository.searchPrivateAccounts(input);

    this.logger.log(`Найдено ${results.length} приватных аккаунтов`);

    return results;
  }

  /**
   * Получить отображаемое имя пользователя
   * @param username Имя пользователя
   * @returns Отображаемое имя (ФИО или название организации)
   */
  async getDisplayName(username: string): Promise<string> {
    return await this.accountDomainService.getDisplayName(username);
  }
}
