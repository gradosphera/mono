import { YooCheckout } from '@a2seven/yoo-checkout';
import { Order } from '../../models';
import { IPNProvider } from '../../services/payment/ipn/ipnProvider';

import type { PaymentDetails } from '../../types';
import IPN from '../../models/ipn.model';
import { checkPaymentAmount, checkPaymentSymbol, getAmountPlusFee } from '../../services/order.service';
import Settings from '../../models/settings.model';
import config from '../../config/config';
import { redisPublisher } from '../../services/redis.service';
import Joi from 'joi';
import { nestApp } from '~/index';
import { ProviderInteractor } from '~/domain/provider/provider.interactor';
import { Inject, Module } from '@nestjs/common';
import {
  APP_REPOSITORY,
  type ExtensionDomainRepository,
} from '~/domain/appstore/repositories/extension-domain.repository.interface';
import { WinstonLoggerService } from '~/modules/logger/logger-app.service';
import type { ExtensionDomainEntity } from '~/domain/appstore/entities/extension-domain.entity';

interface IIpnRequest {
  event: string;
  object: {
    /**
     * Unknown Property
     */
    [x: string]: unknown;
    amount: {
      /**
       * Unknown Property
       */
      [x: string]: unknown;
      currency: string;
      value: string;
    };
    authorization_details?: {
      /**
       * Unknown Property
       */
      [x: string]: unknown;
      auth_code?: string;
      rrn?: string;
      three_d_secure?: {
        /**
         * Unknown Property
         */
        [x: string]: unknown;
        applied?: boolean;
      };
    };
    created_at?: string;
    description?: string;
    expires_at?: string;
    id: string;
    income_amount: {
      /**
       * Unknown Property
       */
      [x: string]: unknown;
      currency: string;
      value: string;
    };
    metadata: {
      secret: string;
      /**
       * Unknown Property
       */
      [x: string]: unknown;
    };
    paid: boolean;
    payment_method: {
      /**
       * Unknown Property
       */
      [x: string]: unknown;
      card?: {
        /**
         * Unknown Property
         */
        [x: string]: unknown;
        card_type?: string;
        expiry_month?: string;
        expiry_year?: string;
        first6?: string;
        issuer_country?: string;
        issuer_name?: string;
        last4?: string;
      };
      id: string;
      saved?: boolean;
      title?: string;
      type: string;
    };
    refundable?: boolean;
    refunded_amount: {
      /**
       * Unknown Property
       */
      [x: string]: unknown;
      currency: string;
      value: string;
    };
    status: string;
    test?: boolean;
  };
  type: string;
}

// Интерфейс для параметров конфигурации плагина powerup
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IConfig {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ILog {}

export class YookassaPlugin extends IPNProvider {
  constructor(
    @Inject(APP_REPOSITORY) private readonly appRepository: ExtensionDomainRepository,
    private readonly logger: WinstonLoggerService
  ) {
    super();
    this.logger.setContext(YookassaPlugin.name);
  }

  name = 'yookassa';
  plugin!: ExtensionDomainEntity<IConfig>;

  async initialize(): Promise<void> {
    const pluginData = await this.appRepository.findByName(this.name);
    if (!pluginData) throw new Error('Конфиг не найден');

    this.plugin = pluginData;

    this.logger.info(`Инициализация ${this.name} с конфигурацией`, this.plugin.config);

    const providerInteractor = nestApp.get(ProviderInteractor);
    providerInteractor.registerProvider(this.name, this);
    console.log(`Платежный провайдер ${this.name} успешно зарегистрирован.`);
  }

  public configSchemas = Joi.object<IConfig>({});

  public tolerance_percent = 0; /// (0.0005%) < Допустимая погрешность приёма платежей
  public fee_percent = 3.5; ///%

  public async handleIPN(request: IIpnRequest): Promise<void> {
    const { event, object } = request;

    const exist = (await IPN.findOne({ 'data.object.id': request.object.id }))?.data as IIpnRequest;

    if (!exist) {
      await IPN.create({ provider: 'yookassa', data: request });

      const { secret } = request.object.metadata;
      const order = await Order.findOne({ secret });

      if (order) {
        this.logger.info('Order found', { source: 'handleIPN', id: order.id });

        if (event === 'payment.succeeded') {
          const [, symbol] = order.quantity.split(' ');

          const symbol_result = checkPaymentSymbol(request.object.income_amount.currency, symbol);

          if (symbol_result.status == 'error') {
            this.logger.warn('Payment symbol verification failed', {
              source: 'handleIPN',
              id: order.id,
              message: symbol_result.message,
            });

            await Order.updateOne({ _id: order.id }, { status: 'failed', message: symbol_result.message });
            redisPublisher.publish(
              `${config.coopname}:orderStatusUpdate`,
              JSON.stringify({ id: order.id, status: 'failed' })
            );
            return;
          }

          const result = checkPaymentAmount(request.object.income_amount.value, order.quantity, this.tolerance_percent);

          if (result.status === 'success') {
            // Обработка успешного платежа
            this.logger.info('Payment amount verified, updating order status to paid', {
              source: 'handleIPN',
              id: order.id,
            });

            await Order.updateOne({ _id: order.id }, { status: 'paid' });
            redisPublisher.publish(`${config.coopname}:orderStatusUpdate`, JSON.stringify({ id: order.id, status: 'paid' }));
          } else {
            // Обработка неудачного платежа
            this.logger.warn('Payment amount verification failed', {
              source: 'handleIPN',
              id: order.id,
              message: result.message,
            });

            await Order.updateOne({ _id: order.id }, { status: 'failed', message: result.message });
            redisPublisher.publish(
              `${config.coopname}:orderStatusUpdate`,
              JSON.stringify({ id: order.id, status: 'failed' })
            );
          }
        } else if (event === 'payment.failed') {
          // Обработка неудачного платежа
          this.logger.warn('Payment failed event received', { source: 'handleIPN', id: order.id });

          await Order.updateOne({ _id: order.id }, { status: 'failed' });
          redisPublisher.publish(`${config.coopname}:orderStatusUpdate`, JSON.stringify({ id: order.id, status: 'failed' }));
        }
      } else {
        //TODO платеж есть, а ордера на него нет. Что делаем?
        this.logger.error('Payment exists, but order not found', undefined, {
          source: 'handleIPN',
          requestId: request.object.id,
        });
      }
    } else {
      this.logger.warn('IPN already processed', { source: 'handleIPN', requestId: request.object.id });
    }
  }

  public async createPayment(
    amount: string,
    symbol: string,
    description: string,
    order_num: number,
    secret: string
  ): Promise<PaymentDetails> {
    const settings = await Settings.getSettings();

    const checkout = new YooCheckout({
      shopId: settings.provider.client,
      secretKey: settings.provider.secret,
    });

    const amount_plus_fee = getAmountPlusFee(parseFloat(amount), this.fee_percent).toFixed(2);
    const fee_amount = (parseFloat(amount_plus_fee) - parseFloat(amount)).toFixed(2);

    // Фактический процент комиссии
    const fact_fee_percent = Math.round((parseFloat(fee_amount) / parseFloat(amount)) * 100 * 100) / 100;

    const payment = await checkout.createPayment(
      {
        description,
        amount: {
          value: amount_plus_fee,
          currency: 'RUB',
        },
        confirmation: {
          type: 'embedded',
        },
        metadata: {
          secret,
        },
        capture: true,
      },
      secret
    );
    return {
      data: payment?.confirmation?.confirmation_token || '',
      amount_plus_fee: `${amount_plus_fee} ${symbol}`,
      amount_without_fee: amount,
      fee_amount: `${fee_amount} ${symbol}`,
      fee_percent: this.fee_percent,
      fact_fee_percent,
      tolerance_percent: this.tolerance_percent,
    };
  }
}

@Module({
  providers: [YookassaPlugin], // Регистрируем SberpollPlugin как провайдер
  exports: [YookassaPlugin], // Экспортируем его для доступа в других модулях
})
export class YookassaPluginModule {
  constructor(private readonly yookassaPlugin: YookassaPlugin) {}

  async initialize() {
    await this.yookassaPlugin.initialize();
  }
}
