import { YooCheckout } from '@a2seven/yoo-checkout';
import { Order } from '../../../models';
import { IPNProvider } from './ipnProvider';
import Redis from 'ioredis';
import type { PaymentDetails } from '../../../types';
import IPN from '../../../models/ipn.model';
import { checkPaymentAmount, checkPaymentSymbol, getAmountPlusFee } from '../../order.service';
import mongoose from 'mongoose';
import logger from '../../../config/logger';

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
  private checkout: YooCheckout;
  public tolerance_percent = 0.05; /// (0.0005%) < Допустимая погрешность приёма платежей
  public fee_percent = 3.5; ///%

  constructor() {
    this.checkout = new YooCheckout({
      shopId: process.env.YA_SHOP_ID as string,
      secretKey: process.env.YA_SHOP_SECRET as string,
      token: process.env.YA_ACCESS_TOKEN as string,
    });
  }
  async handleIPN(request: IIpnRequest): Promise<void> {
    const { event, object } = request;

    const exist = (await IPN.findOne({ 'data.object.id': request.object.id }))?.data as IIpnRequest;

    if (!exist) {
      await IPN.create({ provider: 'yookassa', data: request });

      const { secret } = request.object.metadata;
      const order = await Order.findOne({ secret });

      if (order) {
        logger.info('Order found', { source: 'handleIPN', orderId: order.id });

        if (event === 'payment.succeeded') {
          const [, symbol] = order.quantity.split(' ');

          const symbol_result = checkPaymentSymbol(request.object.income_amount.currency, symbol);

          if (symbol_result.status == 'error') {
            logger.warn('Payment symbol verification failed', {
              source: 'handleIPN',
              orderId: order.id,
              message: symbol_result.message,
            });

            await Order.updateOne({ _id: order.id }, { status: 'failed', message: symbol_result.message });
            redis.publish('orderStatusUpdate', JSON.stringify({ orderId: order.id, status: 'failed' }));
            return;
          }

          const result = checkPaymentAmount(request.object.income_amount.value, order.quantity, this.tolerance_percent);

          if (result.status === 'success') {
            // Обработка успешного платежа
            logger.info('Payment amount verified, updating order status to paid', {
              source: 'handleIPN',
              orderId: order.id,
            });

            await Order.updateOne({ _id: order.id }, { status: 'paid' });
            redis.publish('orderStatusUpdate', JSON.stringify({ orderId: order.id, status: 'paid' }));
          } else {
            // Обработка неудачного платежа
            logger.warn('Payment amount verification failed', {
              source: 'handleIPN',
              orderId: order.id,
              message: result.message,
            });

            await Order.updateOne({ _id: order.id }, { status: 'failed', message: result.message });
            redis.publish('orderStatusUpdate', JSON.stringify({ orderId: order.id, status: 'failed' }));
          }
        } else if (event === 'payment.failed') {
          // Обработка неудачного платежа
          logger.warn('Payment failed event received', { source: 'handleIPN', orderId: order.id });

          await Order.updateOne({ _id: order.id }, { status: 'failed' });
          redis.publish('orderStatusUpdate', JSON.stringify({ orderId: order.id, status: 'failed' }));
        }
      } else {
        //TODO платеж есть, а ордера на него нет. Что делаем?
        logger.error('Payment exists, but order not found', { source: 'handleIPN', requestId: request.object.id });
      }
    } else {
      logger.warn('IPN already processed', { source: 'handleIPN', requestId: request.object.id });
    }
  }

  async createPayment(amount: string, description: string, order_id: number, secret: string): Promise<PaymentDetails> {
    const amount_plus_fee = getAmountPlusFee(parseFloat(amount), this.fee_percent);
    const payment = await this.checkout.createPayment(
      {
        description,
        amount: {
          value: amount_plus_fee.toFixed(2),
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
    };
  }
}

export default YooKassaIPNProvider;
