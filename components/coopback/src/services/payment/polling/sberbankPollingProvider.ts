import { YooCheckout } from '@a2seven/yoo-checkout';
import { PollingProvider } from './pollingProvider';
import { Order } from '../../../models';
import Redis from 'ioredis';
import type { PaymentDetails } from '../../../types';
import { generator } from '../../document.service';

const redis = new Redis();

class SberbankPollingProvider implements PollingProvider {
  public tolerance_percent = 0; /// (0.0005%) < Допустимая погрешность приёма платежей
  public fee_percent = 0; ///%

  private checkout: YooCheckout;

  constructor() {
    this.checkout = new YooCheckout({
      shopId: process.env.YA_SHOP_ID as string,
      secretKey: process.env.YA_SHOP_SECRET as string,
      token: process.env.YA_ACCESS_TOKEN as string,
    });
  }
  sync(): Promise<void> {
    throw new Error('Method not implemented.');
  }
  async createPayment(amount: string, description: string, internal_id: string): Promise<PaymentDetails> {
    // eslint-disable-next-line prettier/prettier
    const cooperative = await generator.constructCooperative(process.env.COOPNAME as string);
    cooperative?.bank_account.bank_name;

    const invoice = `ST00012|Name=${cooperative?.full_name}|PersonalAcc=${
      cooperative?.bank_account.account_number
    }|BankName=${cooperative?.bank_account.bank_name}|BIC=${cooperative?.bank_account.details.bik}|CorrespAcc=${
      cooperative?.bank_account.details.corr
    }|Sum=${parseInt(amount)}00|Purpose=${description} №${internal_id}. Без НДС|PayeeINN=${cooperative?.details.inn}|KPP=${
      cooperative?.details.kpp
    };`;

    const result: PaymentDetails = {
      data: invoice,
    };

    return result;
  }

  async checkPaymentStatus(orderId: string): Promise<string> {
    const payment = await this.checkout.getPayment(orderId);

    //сперва вызываем метод sync и ожидаем завершения.
    //Затем последовательно проверяем все pending ордера сравнивая уже со своей бд.

    if (payment.status === 'succeeded') {
      await Order.updateOne({ _id: orderId }, { status: 'paid' });
      redis.publish('orderStatusUpdate', JSON.stringify({ orderId, status: 'paid' }));
      return 'paid';
    } else if (payment.status === 'canceled') {
      await Order.updateOne({ _id: orderId }, { status: 'failed' });
      redis.publish('orderStatusUpdate', JSON.stringify({ orderId, status: 'failed' }));
      return 'failed';
    }

    return payment.status; // Возвращаем текущий статус для последующей обработки
  }
}

export default SberbankPollingProvider;
