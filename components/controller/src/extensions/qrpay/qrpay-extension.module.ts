import type { PaymentDetails } from '../../types';
import { generator } from '../../services/document.service';
import { getAmountPlusFee } from '../../services/order.service';
import Joi from 'joi';
import { PaymentProvider } from '../../services/payment/paymentProvider';
import { nestApp } from '~/index';
import { ProviderInteractor } from '~/domain/provider/provider.interactor';
import { Inject, Module } from '@nestjs/common';
import {
  EXTENSION_REPOSITORY,
  type ExtensionDomainRepository,
} from '~/domain/extension/repositories/extension-domain.repository';
import { TypeOrmExtensionDomainRepository } from '~/infrastructure/database/typeorm/repositories/typeorm-extension.repository';
import { WinstonLoggerService } from '~/modules/logger/logger-app.service';
import type { ExtensionDomainEntity } from '~/domain/extension/entities/extension-domain.entity';
import { z } from 'zod';
import config from '~/config/config';
import type { Cooperative } from 'cooptypes';

// Дефолтные параметры конфигурации
export const defaultConfig = {};

export const Schema = z.object({});
// eslint-disable-next-line @typescript-eslint/no-empty-interface

// Интерфейс для параметров конфигурации плагина
export type IConfig = z.infer<typeof Schema>;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ILog {}

export class QrPayPlugin extends PaymentProvider {
  constructor(
    @Inject(EXTENSION_REPOSITORY) private readonly extensionRepository: ExtensionDomainRepository,
    private readonly logger: WinstonLoggerService
  ) {
    super();
    this.logger.setContext(QrPayPlugin.name);
  }

  name = 'qrpay';

  plugin!: ExtensionDomainEntity<IConfig>;
  public configSchemas = Schema;
  public defaultConfig = defaultConfig;

  public tolerance_percent = 0; /// (0.0005%) < Допустимая погрешность приёма платежей
  public fee_percent = 0; ///%

  async initialize(): Promise<void> {
    const pluginData = await this.extensionRepository.findByName(this.name);
    if (!pluginData) throw new Error('Конфиг не найден');

    this.plugin = pluginData;

    this.logger.info(`Инициализация ${this.name} с конфигурацией`, this.plugin);

    const providerInteractor = nestApp.get(ProviderInteractor);
    providerInteractor.registerProvider(this.name, this);
    this.logger.log(`Платежный провайдер ${this.name} успешно зарегистрирован.`);
  }

  public async createPayment(
    amount: string,
    symbol: string,
    description: string,
    order_num: number,
    secret: string
  ): Promise<PaymentDetails> {
    // eslint-disable-next-line prettier/prettier
    const cooperative = await generator.constructCooperative(config.coopname);
    const amount_plus_fee = getAmountPlusFee(parseFloat(amount), this.fee_percent).toFixed(2);
    const fee_amount = (parseFloat(amount_plus_fee) - parseFloat(amount)).toFixed(2);
    const fact_fee_percent = Math.round((parseFloat(fee_amount) / parseFloat(amount)) * 100 * 100) / 100;

    const paymentMethod = (await generator.get('paymentMethod', {
      username: config.coopname,
      method_type: 'bank_transfer',
      is_default: true,
    })) as Cooperative.Payments.IPaymentData;

    const bankAccount = paymentMethod.data as Cooperative.Payments.IBankAccount;

    const invoice = `ST00012|Name=${cooperative?.full_name}|PersonalAcc=${bankAccount.account_number}|BankName=${
      bankAccount.bank_name
    }|BIC=${bankAccount.details.bik}|CorrespAcc=${bankAccount.details.corr}|Sum=${parseInt(
      amount
    )}00|Purpose=${description}. Без НДС.|PayeeINN=${cooperative?.details.inn}|KPP=${cooperative?.details.kpp}`;

    const result: PaymentDetails = {
      data: invoice,
      amount_plus_fee: `${amount_plus_fee} ${symbol}`,
      amount_without_fee: amount,
      fee_amount: `${fee_amount} ${symbol}`,
      fee_percent: this.fee_percent,
      fact_fee_percent,
      tolerance_percent: this.tolerance_percent,
    };

    return result;
  }
}

@Module({
  imports: [],
  providers: [
    QrPayPlugin,
    {
      provide: EXTENSION_REPOSITORY, // токен для инъекции
      useClass: TypeOrmExtensionDomainRepository, // Реализация для интерфейса
    },
  ], // Регистрируем PowerupPlugin как провайдер
  exports: [QrPayPlugin], // Экспортируем его для доступа в других модулях
})
export class QrPayPluginModule {
  constructor(private readonly qrPayPlugin: QrPayPlugin) {}

  async initialize() {
    await this.qrPayPlugin.initialize();
  }
}
