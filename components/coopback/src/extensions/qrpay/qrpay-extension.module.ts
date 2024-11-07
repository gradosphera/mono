import type { PaymentDetails } from '../../types';
import { generator } from '../../services/document.service';
import { getAmountPlusFee } from '../../services/order.service';
import Joi from 'joi';
import { PluginLog } from '../../models/pluginLog.model';
import { PaymentProvider } from '../../services/payment/paymentProvider';
import { nestApp } from '~/index';
import { ProviderInteractor } from '~/domain/provider/provider.interactor';
import { Inject, Module } from '@nestjs/common';
import {
  APP_REPOSITORY,
  type ExtensionDomainRepository,
} from '~/domain/appstore/repositories/extension-domain.repository.interface';
import { TypeOrmAppStoreDomainRepository } from '~/infrastructure/database/typeorm/repositories/typeorm-app.repository';
import { WinstonLoggerService } from '~/modules/logger/logger-app.service';
import type { ExtensionDomainEntity } from '~/domain/appstore/entities/extension-domain.entity';

// Интерфейс для параметров конфигурации плагина powerup
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IConfig {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ILog {}

export class QrPayPlugin extends PaymentProvider {
  constructor(
    @Inject(APP_REPOSITORY) private readonly appRepository: ExtensionDomainRepository,
    private readonly logger: WinstonLoggerService
  ) {
    super();
    this.logger.setContext(QrPayPlugin.name);
  }

  name = 'qrpay';

  plugin!: ExtensionDomainEntity<IConfig>;
  public configSchemas = Joi.object<IConfig>({});

  public tolerance_percent = 0; /// (0.0005%) < Допустимая погрешность приёма платежей
  public fee_percent = 0; ///%

  async initialize(): Promise<void> {
    const pluginData = await this.appRepository.findByName(this.name);
    if (!pluginData) throw new Error('Конфиг не найден');

    this.plugin = pluginData;

    this.logger.info(`Инициализация ${this.name} с конфигурацией`, this.plugin);

    const providerInteractor = nestApp.get(ProviderInteractor);
    providerInteractor.registerProvider(this.name, this);
    console.log(`Платежный провайдер ${this.name} успешно зарегистрирован.`);
  }

  private async log(action: ILog) {
    await PluginLog.create({ name: this.name, log: action });
  }

  public async createPayment(
    amount: string,
    symbol: string,
    description: string,
    order_num: number,
    secret: string
  ): Promise<PaymentDetails> {
    console.log('on create');
    // eslint-disable-next-line prettier/prettier
    const cooperative = await generator.constructCooperative(process.env.COOPNAME as string);
    const amount_plus_fee = getAmountPlusFee(parseFloat(amount), this.fee_percent).toFixed(2);
    const fee_amount = (parseFloat(amount_plus_fee) - parseFloat(amount)).toFixed(2);
    const fact_fee_percent = Math.round((parseFloat(fee_amount) / parseFloat(amount)) * 100 * 100) / 100;

    const invoice = `ST00012|Name=${cooperative?.full_name}|PersonalAcc=${
      cooperative?.bank_account.account_number
    }|BankName=${cooperative?.bank_account.bank_name}|BIC=${cooperative?.bank_account.details.bik}|CorrespAcc=${
      cooperative?.bank_account.details.corr
    }|Sum=${parseInt(amount)}00|Purpose=${description}. Без НДС.|PayeeINN=${cooperative?.details.inn}|KPP=${
      cooperative?.details.kpp
    }`;

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
      provide: APP_REPOSITORY, // токен для инъекции
      useClass: TypeOrmAppStoreDomainRepository, // Реализация для интерфейса
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
