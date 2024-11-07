import { PollingProvider } from '../../services/payment/polling/pollingProvider';
import { Order } from '../../models';
import type { PaymentDetails } from '../../types';
import { generator } from '../../services/document.service';
import { redisPublisher } from '../../services/redis.service';
import { PaymentState } from '../../models/paymentState.model';
import axios from 'axios';
import { checkPaymentAmount, checkPaymentSymbol, getAmountPlusFee } from '../../services/order.service';
import { orderStatus } from '../../types/order.types';
import config from '../../config/config';
import Joi from 'joi';
import { PluginLog } from '../../models/pluginLog.model';
import { Inject, Module } from '@nestjs/common';
import {
  APP_REPOSITORY,
  type ExtensionDomainRepository,
} from '~/domain/appstore/repositories/extension-domain.repository.interface';
import { WinstonLoggerService } from '~/modules/logger/logger-app.service';
import type { ExtensionDomainEntity } from '~/domain/appstore/entities/extension-domain.entity';

interface Link {
  href: string;
  rel: string;
}

interface StatementTransactionV2 {
  id: string;
  transactionDate: string;
  paymentPurpose: string;
  amountRub: {
    amount: string;
    currencyName: string;
  };
  direction: 'DEBIT' | 'CREDIT';
  documentDate: string; //дата 2023-11-14;
  rurTransfer: {
    payerAccount: string; //'40802810706000000087';
    payerName: string; //'ИП_Автотест_Клиент_ЕКС_20231027092336';
    payerInn: string; //'213504669246';
    payerKpp: string; //'346801713';
    payerBankName: string; //'БАШКИРСКОЕ ОТДЕЛЕНИЕ N8598 ПАО СБЕРБАНК, г. Уфа';
    payerBankBic: string; //'048073601';
    payerBankCorrAccount: string; //'30101810300000000601';
    payeeAccount: string; //'40702810006000001792';
    payeeName: string; //'ТЕСТ9036';
    payeeInn: string; //'7379190522';
    payeeKpp: string; //'683801910';
    payeeBankName: string; //'БАШКИРСКОЕ ОТДЕЛЕНИЕ N8598 ПАО СБЕРБАНК, г. Уфа';
    payeeBankBic: string; //'048073601';
    payeeBankCorrAccount: string; //'30101810300000000601';
    receiptDate: string; //'2023-11-14';
    valueDate: string; //'2023-11-14';
  };
  // Добавьте другие необходимые поля
  // https://developers.sber.ru/docs/ru/sber-api/host/statements
}

interface StatementTransactionsV2 {
  _links: Link[];
  transactions: StatementTransactionV2[];
}

// Интерфейс для параметров конфигурации плагина powerup
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IConfig {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ILog {}

export class SberpollPlugin extends PollingProvider {
  constructor(
    @Inject(APP_REPOSITORY) private readonly appRepository: ExtensionDomainRepository,
    private readonly logger: WinstonLoggerService
  ) {
    super();
    this.logger.setContext(SberpollPlugin.name);
  }

  name = 'sberpoll';
  plugin!: ExtensionDomainEntity<IConfig>;

  public configSchemas = Joi.object<IConfig>({});

  public tolerance_percent = 0; /// (0.0005%) < Допустимая погрешность приёма платежей
  public fee_percent = 0; ///%

  async initialize(): Promise<void> {
    const pluginData = await this.appRepository.findByName(this.name);

    if (!pluginData) throw new Error('Конфиг не найден');

    this.plugin = pluginData;

    this.logger.info(`Инициализация ${this.name} с конфигурацией`, this.plugin);
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

  private getAccessToken(): string {
    // Реализуйте получение токена доступа
    return 'YOUR_ACCESS_TOKEN';
  }

  private extractOrderNumber(paymentPurpose: string): string {
    const regex = /№(\d+)/;
    const match = paymentPurpose.match(regex);
    if (match && match[1]) {
      return match[1];
    }
    return '';
  }

  private getApiUrl(): string {
    return `https://api.sberbank.ru/fintech/api/v2/statement/transactions`;
  }

  private getAccountNumber(): string {
    return 'ВАШ_НОМЕР_СЧЕТА';
  }

  private getStatementDate(): string {
    return '2023-10-01';
  }

  public async sync(): Promise<void> {
    const accessToken = await this.getAccessToken();
    const accountNumber = this.getAccountNumber();
    const statementDate = this.getStatementDate();

    // Загрузка состояния обработки
    let paymentState = await PaymentState.findOne({ accountNumber, statementDate });

    // Если состояния нет, создаем новое
    if (!paymentState) {
      paymentState = new PaymentState({
        accountNumber,
        statementDate,
        lastProcessedPage: 1, // Начинаем с первой страницы
      });
    }

    let hasNextPage = true;
    let page = paymentState.lastProcessedPage; // Начинаем с сохраненной страницы

    // Формирование URL запроса
    const url = this.getApiUrl();

    while (hasNextPage) {
      // Параметры запроса
      const params = {
        accountNumber,
        statementDate,
        page,
      };

      try {
        // Выполнение запроса к API
        const response = await axios.get<StatementTransactionsV2>(url, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/json',
          },
          params,
        });

        const data = response.data;

        // Обработка транзакций
        const transactions = data.transactions || [];

        for (const transaction of transactions) {
          // Извлечение номера заказа
          const orderNumber = this.extractOrderNumber(transaction.paymentPurpose);

          if (!orderNumber) {
            this.logger.warn(
              `Не найден номер заказа в строке назначения платежа: ${transaction.paymentPurpose} транзакции ${transaction.id}`
            );
            break; //прерываем цикл - в платеже не указан номер заказа
          }

          this.logger.info(`Обработка транзакции ${transaction.id} с номером заказа ${orderNumber}`);

          const order = await Order.findOne({ order_num: orderNumber });

          if (!order) {
            this.logger.warn(`Не найден заказ с номером ${orderNumber} по транзакции ${transaction.id}`);
            break;
          }

          const [, symbol] = order.quantity.split(' ');
          const symbol_check = checkPaymentSymbol(transaction.amountRub.currencyName, symbol);

          if (symbol_check.status === 'error') {
            this.logger.warn(symbol_check.message);
            order.status = orderStatus.failed;
            order.message = symbol_check.message;
            await order.save();
            redisPublisher.publish(
              `${config.coopname}:orderStatusUpdate`,
              JSON.stringify({ id: order.id, status: 'failed' })
            );
            break;
          }

          //ордер найден, проверяем сумму платежа
          const amount_check = checkPaymentAmount(transaction.amountRub.amount, order.quantity, this.tolerance_percent);

          if (amount_check.status === 'error') {
            this.logger.warn(amount_check.message);
            order.status = orderStatus.failed;
            order.message = amount_check.message;
            await order.save();
            redisPublisher.publish(
              `${config.coopname}:orderStatusUpdate`,
              JSON.stringify({ id: order.id, status: 'failed' })
            );
            break;
          }

          //отмечаем ордер оплаченным если все проверки пройдены
          order.status = orderStatus.paid;
          await order.save();

          redisPublisher.publish(`${config.coopname}:orderStatusUpdate`, JSON.stringify({ id: order.id, status: 'paid' }));
        }

        // Обновление состояния после обработки текущей страницы
        paymentState.lastProcessedPage = page;
        await paymentState.save();

        // Проверка наличия следующей страницы
        const nextLinkObj = data._links?.find((link) => link.rel === 'next');

        if (nextLinkObj) {
          hasNextPage = true;
          page += 1; // Увеличиваем номер страницы на 1
        } else {
          hasNextPage = false;
        }
      } catch (error) {
        this.logger.error(`Ошибка при обработке страницы ${page}: ${error}`);
        hasNextPage = false;
      }
    }

    this.logger.info('Все транзакции обработаны.');
  }
}

@Module({
  providers: [SberpollPlugin], // Регистрируем SberpollPlugin как провайдер
  exports: [SberpollPlugin], // Экспортируем его для доступа в других модулях
})
export class SberpollPluginModule {
  constructor(private readonly sberpollPlugin: SberpollPlugin) {}

  async initialize() {
    await this.sberpollPlugin.initialize();
  }
}
