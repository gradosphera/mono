import { Injectable, Inject, Logger, NotFoundException } from '@nestjs/common';
import type { SetPaymentStatusInputDomainInterface } from '../interfaces/set-payment-status-domain-input.interface';
import type { InternalPaymentFiltersDomainInterface } from '../interfaces/payment-filters-domain.interface';
import type {
  PaginationInputDomainInterface,
  PaginationResultDomainInterface,
} from '~/domain/common/interfaces/pagination.interface';
import { PaymentDomainEntity } from '../entities/payment-domain.entity';
import { GatewayBlockchainPort, GATEWAY_BLOCKCHAIN_PORT } from '../ports/gateway-blockchain.port';
import { PaymentRepository, PAYMENT_REPOSITORY } from '../repositories/payment.repository';
import { PaymentStatusEnum } from '../enums/payment-status.enum';
import { PaymentDirectionEnum, PaymentTypeEnum } from '../enums/payment-type.enum';
import type { PaymentDomainInterface } from '../interfaces/payment-domain.interface';
import type { CreateInitialPaymentInputDomainInterface } from '../interfaces/create-initial-payment-input-domain.interface';
import type { CreateDepositPaymentInputDomainInterface } from '../interfaces/create-deposit-payment-input-domain.interface';
import config from '~/config/config';
import { AccountDomainInteractor } from '~/domain/account/interactors/account.interactor';
import type { CompleteIncomeDomainInterface } from '../interfaces/complete-income-domain.interface';
import type { CompleteOutcomeDomainInterface } from '../interfaces/complete-outcome-domain.interface';
import { generateUniqueHash } from '~/utils/generate-hash.util';
import { ProviderInteractor } from '~/domain/provider/provider.interactor';
import { QuantityUtils } from '~/shared/utils/quantity.utils';
import { SystemDomainInteractor } from '~/domain/system/interactors/system.interactor';
import { AccountDomainService, ACCOUNT_DOMAIN_SERVICE } from '~/domain/account/services/account-domain.service';
import { AccountType } from '~/modules/account/enum/account-type.enum';
import Settings from '~/models/settings.model';

/**
 * Интерактор домена gateway для управления платежами (просмотр, изменение статуса и создание)
 *
 * Особенности работы с истечением платежей:
 * - Все новые платежи (регистрация и депозит) автоматически получают срок истечения +24 часа
 * - При создании нового платежа проверяется наличие активного платежа того же типа
 * - Истекшие платежи автоматически обновляются в статус EXPIRED при создании новых платежей
 * - Доступен отдельный метод expireOutdatedPayments() для периодической очистки
 */
@Injectable()
export class GatewayInteractor {
  private readonly logger = new Logger(GatewayInteractor.name);

  constructor(
    @Inject(GATEWAY_BLOCKCHAIN_PORT)
    private readonly gatewayBlockchainPort: GatewayBlockchainPort,
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: PaymentRepository,
    private readonly accountDomainInteractor: AccountDomainInteractor,
    private readonly providerInteractor: ProviderInteractor,
    private readonly systemDomainInteractor: SystemDomainInteractor,
    @Inject(ACCOUNT_DOMAIN_SERVICE)
    private readonly accountDomainService: AccountDomainService
  ) {}

  /**
   * Создать дату истечения платежа (24 часа от текущего момента)
   * @returns дата истечения
   */
  private createPaymentExpirationDate(): Date {
    return new Date(Date.now() + 24 * 60 * 60 * 1000);
  }

  /**
   * Получить платежи с фильтрацией (универсальный метод с поддержкой секрета)
   */
  async getPayments(
    filters: InternalPaymentFiltersDomainInterface,
    options: PaginationInputDomainInterface
  ): Promise<PaginationResultDomainInterface<PaymentDomainEntity>> {
    const result = await this.paymentRepository.getAllPayments(filters, options);

    // Преобразуем результаты в доменные сущности
    const items = result.items.map((item) => new PaymentDomainEntity(item));

    return {
      items,
      totalCount: result.totalCount,
      totalPages: result.totalPages,
      currentPage: result.currentPage,
    };
  }

  /**
   * Установить статус платежа (работает для входящих и исходящих платежей)
   */
  async setPaymentStatus(data: SetPaymentStatusInputDomainInterface): Promise<PaymentDomainEntity> {
    try {
      const payment = await this.paymentRepository.findById(data.id);
      if (!payment) {
        throw new NotFoundException(`Не удалось найти платеж с ID ${data.id}`);
      }

      const paymentEntity = new PaymentDomainEntity(payment);
      const statusEnum = data.status as unknown as PaymentStatusEnum;

      // Проверяем можно ли изменить статус
      if (!paymentEntity.canChangeStatus()) {
        throw new Error(`Невозможно изменить статус платежа с текущим статусом: ${payment.status}`);
      }

      const result = await this.paymentRepository.setPaymentStatus(data.id, statusEnum);

      if (!result) {
        throw new NotFoundException(`Не удалось найти платеж с ID ${data.id}`);
      }

      // Обрабатываем платеж при статусе PAID
      if (statusEnum === PaymentStatusEnum.PAID) {
        if (result.direction === PaymentDirectionEnum.INCOMING) {
          // Обработка входящих платежей
          await this.processIncomingPayment(result);
        } else if (result.direction === PaymentDirectionEnum.OUTGOING) {
          // Обработка исходящих платежей
          await this.processOutgoingPayment(result);
        }
      }

      return new PaymentDomainEntity(result);
    } catch (error: any) {
      this.logger.error(`Не удалось обновить статус платежа: ${error.message}`);
      throw new NotFoundException(`Не удалось найти платеж с ID ${data.id}`);
    }
  }

  /**
   * Выполнить процессинг платежа
   */
  async executeIncomePayment(id: string, status: PaymentStatusEnum) {
    const payment = await this.paymentRepository.findById(id);
    if (!payment) {
      this.logger.error(`Платеж с ID ${id} не найден`);
      return;
    }

    if (status === PaymentStatusEnum.PAID && payment.status !== PaymentStatusEnum.COMPLETED) {
      await this.processIncomingPayment(payment);
    } else {
      this.logger.warn(`Платеж с ID ${id} имеет статус ${status}, пропускаем обработку`);
    }
  }

  /**
   * Обработка входящих платежей
   */
  private async processIncomingPayment(payment: PaymentDomainInterface) {
    this.logger.log(`Обрабатываем входящий платеж ${payment.id}`);

    try {
      if (payment.type === PaymentTypeEnum.REGISTRATION) {
        await this.accountDomainInteractor.registerBlockchainAccount(payment.username);
        this.logger.log(`Новый пользователь зарегистрирован: ${payment.username}`);
        if (payment.id) {
          await this.paymentRepository.update(payment.id, { status: PaymentStatusEnum.COMPLETED });
        }
      } else if (payment.type === PaymentTypeEnum.DEPOSIT) {
        // Парсим quantity и форматируем для блокчейна с правильным precision
        const blockchainFormattedQuantity = QuantityUtils.formatQuantityForBlockchain(payment.quantity, payment.symbol);

        const completeIncomeData: CompleteIncomeDomainInterface = {
          coopname: payment.coopname,
          username: payment.username,
          quantity: blockchainFormattedQuantity,
          income_hash: payment.hash,
        };
        await this.gatewayBlockchainPort.completeIncome(completeIncomeData);
        if (payment.id) {
          await this.paymentRepository.update(payment.id, { status: PaymentStatusEnum.COMPLETED });
        }
        this.logger.log(`Пользователь ${payment.username} внес паевой взнос на сумму ${blockchainFormattedQuantity}`);
      }
    } catch (e: any) {
      if (payment.id) {
        await this.paymentRepository.update(payment.id, {
          status: PaymentStatusEnum.FAILED,
          message: e.message,
        });
      }
      this.logger.error(`Ошибка обработки входящего платежа: ${payment.id}, сообщение: ${e.message}`, e);
    }
  }

  /**
   * Обработка исходящих платежей
   */
  private async processOutgoingPayment(payment: PaymentDomainInterface) {
    this.logger.log(`Обрабатываем исходящий платеж ${payment.id}`);

    try {
      const completeOutcomeData: CompleteOutcomeDomainInterface = {
        coopname: payment.coopname,
        outcome_hash: payment.hash,
      };

      await this.gatewayBlockchainPort.completeOutcome(completeOutcomeData);

      if (payment.id) {
        await this.paymentRepository.update(payment.id, { status: PaymentStatusEnum.COMPLETED });
      }

      this.logger.log(`Завершен исходящий платеж: ${payment.hash} для пользователя ${payment.username}`);
    } catch (e: any) {
      if (payment.id) {
        await this.paymentRepository.update(payment.id, {
          status: PaymentStatusEnum.FAILED,
          message: e.message,
        });
      }
      this.logger.error(`Ошибка обработки исходящего платежа: ${payment.id}, сообщение: ${e.message}`, e);
    }
  }

  /**
   * Создать регистрационный платеж
   */
  async createInitialPayment(data: CreateInitialPaymentInputDomainInterface): Promise<PaymentDomainEntity> {
    // Обновляем истекшие платежи перед созданием нового
    await this.paymentRepository.expireOutdatedPayments();

    // Получаем информацию о системе для извлечения сумм платежей
    const systemInfo = await this.systemDomainInteractor.getInfo();
    const cooperatorAccount = systemInfo.cooperator_account;

    // Получаем информацию об аккаунте пользователя для определения типа
    const userAccount = await this.accountDomainService.getAccount(data.username);

    if (!userAccount.private_account) {
      throw new Error(`Не удалось определить тип аккаунта для пользователя ${data.username}`);
    }

    // Определяем сумму платежа на основе типа аккаунта
    let registrationAmount: string;
    if (userAccount.private_account.type === AccountType.organization) {
      registrationAmount = cooperatorAccount.org_registration;
    } else {
      // Для individual и entrepreneur используем обычную сумму registration
      registrationAmount = cooperatorAccount.registration;
    }

    // Парсим количество и символ из строки суммы
    const { amount, symbol } = QuantityUtils.parseQuantityString(registrationAmount);

    // Валидируем символ
    QuantityUtils.validateSymbol(symbol);

    // Проверяем, нет ли уже активного платежа этого типа для пользователя с такой же суммой
    const existingPayment = await this.paymentRepository.findActivePendingPayment(
      data.username,
      PaymentTypeEnum.REGISTRATION,
      amount,
      symbol
    );

    if (existingPayment) {
      this.logger.log(
        `Найден существующий активный регистрационный платеж для пользователя ${data.username} на сумму ${amount} ${symbol}`
      );
      return new PaymentDomainEntity(existingPayment);
    }

    // Получаем настройки для определения провайдера
    const settings = await Settings.getSettings();
    const provider = settings.provider.name;

    const secret = generateUniqueHash();
    const hash = generateUniqueHash();
    const now = new Date();
    const expiredAt = this.createPaymentExpirationDate();

    const paymentData: PaymentDomainInterface = {
      id: '', // будет установлен в репозитории
      coopname: config.coopname,
      username: data.username,
      quantity: amount,
      symbol: symbol,
      secret,
      type: PaymentTypeEnum.REGISTRATION,
      direction: PaymentDirectionEnum.INCOMING,
      provider,
      status: PaymentStatusEnum.PENDING,
      memo: `Вступительный и минимальный паевой взносы №${hash.slice(0, 8)}`,
      payment_method_id: undefined,
      expired_at: expiredAt,
      created_at: now,
      updated_at: now,
      hash,
    };

    // Создаем платеж в базе данных
    const createdPayment = await this.paymentRepository.create(paymentData);

    if (!createdPayment.id) {
      throw new Error('Не удалось создать платеж - отсутствует ID');
    }

    // Получаем провайдер и создаем платежные детали
    const paymentProvider = this.providerInteractor.getProvider(provider);
    if (!paymentProvider) {
      throw new Error(`Провайдер ${provider} не найден`);
    }

    try {
      const paymentDetails = await paymentProvider.createPayment(hash);

      // Обновляем платеж с деталями
      await this.paymentRepository.update(createdPayment.id, {
        payment_details: paymentDetails,
      });

      // Возвращаем обновленный платеж
      const updatedPayment = await this.paymentRepository.findById(createdPayment.id);
      if (!updatedPayment) {
        throw new Error(`Не удалось найти обновленный платеж с ID ${createdPayment.id}`);
      }
      return new PaymentDomainEntity(updatedPayment);
    } catch (error: any) {
      this.logger.error(`Ошибка при создании платежных деталей: ${error.message}`);
      // Если не удалось создать детали платежа, помечаем платеж как неудачный
      await this.paymentRepository.update(createdPayment.id, {
        status: PaymentStatusEnum.FAILED,
        message: `Ошибка создания платежа: ${error.message}`,
      });
      throw error;
    }
  }

  /**
   * Создать депозитный платеж
   */
  async createDeposit(data: CreateDepositPaymentInputDomainInterface): Promise<PaymentDomainEntity> {
    // Обновляем истекшие платежи перед созданием нового
    await this.paymentRepository.expireOutdatedPayments();

    // Валидируем символ перед созданием платежа
    QuantityUtils.validateSymbol(data.symbol);

    // Проверяем, нет ли уже активного платежа этого типа для пользователя с такой же суммой
    const existingPayment = await this.paymentRepository.findActivePendingPayment(
      data.username,
      PaymentTypeEnum.DEPOSIT,
      data.quantity,
      data.symbol
    );

    if (existingPayment) {
      this.logger.log(
        `Найден существующий активный депозитный платеж для пользователя ${data.username} на сумму ${data.quantity} ${data.symbol}`
      );
      return new PaymentDomainEntity(existingPayment);
    }

    // Получаем настройки для определения провайдера
    const settings = await Settings.getSettings();
    const provider = settings.provider.name;

    const secret = generateUniqueHash();
    const hash = generateUniqueHash();
    const now = new Date();
    const expiredAt = this.createPaymentExpirationDate();

    const paymentData: PaymentDomainInterface = {
      id: '', // будет установлен в репозитории
      coopname: config.coopname,
      username: data.username,
      quantity: data.quantity,
      symbol: data.symbol,
      type: PaymentTypeEnum.DEPOSIT,
      direction: PaymentDirectionEnum.INCOMING,
      provider: provider,
      status: PaymentStatusEnum.PENDING,
      memo: `Паевой взнос по соглашению о ЦПП "Цифровой Кошелёк" №${hash.slice(0, 8)}`,
      secret,
      payment_method_id: undefined,
      expired_at: expiredAt,
      created_at: now,
      updated_at: now,
      hash,
    };

    // Создаем платеж в базе данных
    const createdPayment = await this.paymentRepository.create(paymentData);

    if (!createdPayment.id) {
      throw new Error('Не удалось создать платеж - отсутствует ID');
    }

    // Получаем провайдер и создаем платежные детали
    const paymentProvider = this.providerInteractor.getProvider(provider);
    if (!paymentProvider) {
      throw new Error(`Провайдер ${provider} не найден`);
    }

    try {
      const paymentDetails = await paymentProvider.createPayment(hash);

      // Обновляем платеж с деталями
      await this.paymentRepository.update(createdPayment.id, {
        payment_details: paymentDetails,
      });

      // Возвращаем обновленный платеж
      const updatedPayment = await this.paymentRepository.findById(createdPayment.id);
      if (!updatedPayment) {
        throw new Error(`Не удалось найти обновленный платеж с ID ${createdPayment.id}`);
      }
      return new PaymentDomainEntity(updatedPayment);
    } catch (error: any) {
      this.logger.error(`Ошибка при создании платежных деталей: ${error.message}`);
      // Если не удалось создать детали платежа, помечаем платеж как неудачный
      await this.paymentRepository.update(createdPayment.id, {
        status: PaymentStatusEnum.FAILED,
        message: `Ошибка создания платежа: ${error.message}`,
      });
      throw error;
    }
  }

  /**
   * Обновить все истекшие платежи в статус EXPIRED
   * Может вызываться периодически или по требованию
   * @returns количество обновленных платежей
   */
  async expireOutdatedPayments(): Promise<number> {
    try {
      const expiredCount = await this.paymentRepository.expireOutdatedPayments();
      if (expiredCount > 0) {
        this.logger.log(`Истекло ${expiredCount} платежей (переведены в статус EXPIRED)`);
      }
      return expiredCount;
    } catch (error: any) {
      this.logger.error(`Ошибка при истечении платежей: ${error.message}`, error);
      return 0;
    }
  }
}
