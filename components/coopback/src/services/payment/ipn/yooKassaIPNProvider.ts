import { YooCheckout } from '@a2seven/yoo-checkout';
import { Order } from '../../../models';
import { IPNProvider } from './ipnProvider';
import Redis from 'ioredis';
import type { PaymentDetails } from '../../../types';
import IPN from '../../../models/ipn.model';
import { checkPaymentAmount, checkPaymentSymbol, getAmountPlusFee } from '../../order.service';
import mongoose from 'mongoose';
import logger from '../../../config/logger';
import Settings from '../../../models/settings.model';
import type { isDeepStrictEqual } from 'util';
import config from '../../../config/config';

const redis = new Redis();

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

class YooKassaIPNProvider implements IPNProvider {
  public tolerance_percent = 0; /// (0.0005%) < Допустимая погрешность приёма платежей
  public fee_percent = 3.5; ///%

  async handleIPN(request: IIpnRequest): Promise<void> {
    const { event, object } = request;

    const exist = (await IPN.findOne({ 'data.object.id': request.object.id }))?.data as IIpnRequest;

    if (!exist) {
      await IPN.create({ provider: 'yookassa', data: request });

      const { secret } = request.object.metadata;
      const order = await Order.findOne({ secret });

      if (order) {
        logger.info('Order found', { source: 'handleIPN', id: order.id });

        if (event === 'payment.succeeded') {
          const [, symbol] = order.quantity.split(' ');

          const symbol_result = checkPaymentSymbol(request.object.income_amount.currency, symbol);

          if (symbol_result.status == 'error') {
            logger.warn('Payment symbol verification failed', {
              source: 'handleIPN',
              id: order.id,
              message: symbol_result.message,
            });

            await Order.updateOne({ _id: order.id }, { status: 'failed', message: symbol_result.message });
            redis.publish(`${config.coopname}:orderStatusUpdate`, JSON.stringify({ id: order.id, status: 'failed' }));
            return;
          }

          const result = checkPaymentAmount(request.object.income_amount.value, order.quantity, this.tolerance_percent);

          if (result.status === 'success') {
            // Обработка успешного платежа
            logger.info('Payment amount verified, updating order status to paid', {
              source: 'handleIPN',
              id: order.id,
            });

            await Order.updateOne({ _id: order.id }, { status: 'paid' });
            redis.publish(`${config.coopname}:orderStatusUpdate`, JSON.stringify({ id: order.id, status: 'paid' }));
          } else {
            // Обработка неудачного платежа
            logger.warn('Payment amount verification failed', {
              source: 'handleIPN',
              id: order.id,
              message: result.message,
            });

            await Order.updateOne({ _id: order.id }, { status: 'failed', message: result.message });
            redis.publish(`${config.coopname}:orderStatusUpdate`, JSON.stringify({ id: order.id, status: 'failed' }));
          }
        } else if (event === 'payment.failed') {
          // Обработка неудачного платежа
          logger.warn('Payment failed event received', { source: 'handleIPN', id: order.id });

          await Order.updateOne({ _id: order.id }, { status: 'failed' });
          redis.publish(`${config.coopname}:orderStatusUpdate`, JSON.stringify({ id: order.id, status: 'failed' }));
        }
      } else {
        //TODO платеж есть, а ордера на него нет. Что делаем?
        logger.error('Payment exists, but order not found', { source: 'handleIPN', requestId: request.object.id });
      }
    } else {
      logger.warn('IPN already processed', { source: 'handleIPN', requestId: request.object.id });
    }
  }

  async createPayment(
    amount: string,
    symbol: string,
    description: string,
    order_id: number,
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

export default YooKassaIPNProvider;
