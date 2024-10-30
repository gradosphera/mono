import { PollingProvider } from '../../services/payment/polling/pollingProvider';
import { Order } from '../../models';
import type { PaymentDetails } from '../../types';
import { generator } from '../../services/document.service';
import { redisPublisher } from '../../services/redis.service';
import { PaymentState } from '../../models/paymentState.model';
import axios from 'axios';
import logger from '../../config/logger';
import { checkPaymentAmount, checkPaymentSymbol, getAmountPlusFee } from '../../services/order.service';
import { orderStatus } from '../../types/order.types';
import config from '../../config/config';
import type { IPlugin, IPluginSchema } from '../../types/plugin.types';
import { PluginConfig } from '../../models/pluginConfig.model';
import Joi from 'joi';
import { PluginLog } from '../../models/pluginLog.model';
import { PaymentProvider } from '../../services/payment/paymentProvider';

// Интерфейс для параметров конфигурации плагина powerup
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IConfig {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ILog {}

export class Plugin extends PaymentProvider implements IPlugin<IConfig> {
  name = 'qrpay';

  plugin!: IPluginSchema<IConfig>;
  public configSchemas = Joi.object<IConfig>({});

  public tolerance_percent = 0; /// (0.0005%) < Допустимая погрешность приёма платежей
  public fee_percent = 0; ///%

  async initialize(config: any): Promise<void> {
    const pluginData = await PluginConfig.findOne({ name: this.name });
    if (!pluginData) throw new Error('Конфиг не найден');

    this.plugin = pluginData;

    logger.info(`Инициализация ${this.name} с конфигурацией`, this.plugin);
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

export default Plugin;
