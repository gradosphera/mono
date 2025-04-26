import { Order } from '../../../models/index';
import mongoose, { type ObjectId } from 'mongoose';
import { getUserByUsername } from '../../../services/user.service';
import logger from '../../../config/logger';
import { generator } from '../../../services/document.service';
import { orderStatus, type IOrder } from '../../../types/order.types';
import ApiError from '../../../utils/ApiError';
import httpStatus from 'http-status';
import { redisPublisher } from '../../../services/redis.service';
import crypto from 'crypto';
import Settings from '../../../models/settings.model';
import { blockchainService, userService } from '../../../services';
import config from '../../../config/config';
import { userStatus } from '../../../types/user.types';

import { Injectable } from '@nestjs/common';
import { PaymentTypeDomainInterface } from '../interfaces/payment-type-domain.interface';
import { ProviderDomainService } from '~/domain/provider/provider-domain.service';
import type { PaginationResultLegacy } from '~/types/pagination.types';
import type { CreateDepositPaymentInputDomainInterface } from '../interfaces/create-deposit-input-domain.interface';
import type { CreateInitialPaymentInputDomainInterface } from '../interfaces/create-initial-input-domain.interface';
import type { SetPaymentStatusInputDomainInterface } from '../interfaces/set-payment-status-domain-input.interface';
import { sha256 } from '~/utils/sha256';

@Injectable()
export class PaymentDomainService {
  constructor(private readonly providerDomainService: ProviderDomainService) {}

  async createOrder(
    username: string,
    providerName: string,
    type: PaymentTypeDomainInterface,
    amount: string
  ): Promise<IOrder> {
    const cooperative = await generator.constructCooperative(config.coopname);

    if (!cooperative) throw new Error('Кооператив не найден');

    const session = await mongoose.startSession();

    const [, symbol] = amount.split(' ');

    let result;
    try {
      await session.withTransaction(async () => {
        const user = await getUserByUsername(username);
        let db_order;

        if (type === PaymentTypeDomainInterface.REGISTRATION && user.initial_order) {
          db_order = await Order.findOne({ _id: user.initial_order }); //add expiration
        }

        if (!db_order) {
          db_order = new Order({
            creator: config.coopname,
            secret: this.generateOrderSecret(),
            status: orderStatus.pending,
            type: type,
            provider: providerName,
            username,
            quantity: amount,
            symbol: symbol,
            user: user._id as unknown as ObjectId,
          });
          user.initial_order = db_order._id;

          await db_order.save({ session });
          await user.save({ session });
        }

        const secret = db_order.secret;

        const provider = this.providerDomainService.getProvider(providerName);

        const paymentDetails = await provider.createPayment(
          amount,
          symbol,
          type === 'deposit'
            ? `Паевой взнос по соглашению о ЦПП "Цифровой Кошелёк" №${db_order._id.toString().slice(0, 8)}`
            : `Вступительный и минимальный паевый взносы №${db_order._id.toString().slice(0, 8)}`,
          db_order.order_num as number,
          secret
        );

        db_order.details = paymentDetails;

        await db_order.save({ session });

        logger.info('Order created', { providerName, type, username, amount, source: 'createDeposit' });

        result = db_order;
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      logger.error(`Error happen on createOrder process: ${e.message}`);
      throw e;
    }
    return result;
  }

  async createDeposit(data: CreateDepositPaymentInputDomainInterface): Promise<IOrder> {
    const cooperative = await generator.constructCooperative(config.coopname);
    if (!cooperative) throw new Error('Кооператив не найден');

    const [, symbol_initial] = cooperative.initial.split(' ');

    const [amount, symbol] = data.quantity.split(' ');
    const quantity = `${parseFloat(amount).toFixed(4)} ${symbol}`;
    if (symbol_initial != symbol) throw new ApiError(httpStatus.BAD_REQUEST, 'Неверный символ для платежа');

    const provider = (await Settings.getSettings()).provider.name;

    return this.createOrder(data.username, provider, PaymentTypeDomainInterface.DEPOSIT, quantity);
  }

  async createInitialOrder(data: CreateInitialPaymentInputDomainInterface): Promise<IOrder> {
    const cooperative = await generator.constructCooperative(config.coopname);
    if (!cooperative) throw new Error('Кооператив не найден');

    const user = await getUserByUsername(data.username);

    let amount = '';

    if (user.type === 'individual' || user.type === 'entrepreneur') {
      amount = cooperative.registration;
    } else {
      amount = cooperative.org_registration;
    }

    const provider = (await Settings.getSettings()).provider.name;

    return this.createOrder(data.username, provider, PaymentTypeDomainInterface.REGISTRATION, amount);
  }

  checkPaymentSymbol(incomeSymbol: string, extectedSymbol: string) {
    if (incomeSymbol != extectedSymbol) return { status: 'error', message: `${incomeSymbol} != expectedSymbol` };
    else return { status: 'success', message: '' };
  }

  checkPaymentAmount(incomeAmount: string, expectedAmount: string, tolerancePercentage: number) {
    //погрешность возникает при округлении суммы платежа на стороне провайдера при расчете им процентов комиссии
    const tolerance = parseFloat(expectedAmount) * (tolerancePercentage / 100); // Абсолютное значение погрешности

    if (parseFloat(incomeAmount) < parseFloat(expectedAmount) - tolerance) {
      return {
        status: 'error',
        message: `Недостаточно средств, поступило: ${incomeAmount}, ожидается: ${expectedAmount}`,
      };
    }

    return {
      status: 'success',
      message: '',
    };
  }

  generateOrderSecret(length = 48): string {
    return crypto.randomBytes(length).toString('hex'); // Генерирует случайный секрет в виде hex-строки
  }

  getAmountPlusFee(amount: number, fee: number): number {
    if (fee < 0 || fee >= 100) {
      throw new Error('Fee must be between 0 and 100.');
    }
    return amount / ((100 - fee) / 100);
  }

  async setStatus(data: SetPaymentStatusInputDomainInterface): Promise<IOrder> {
    const order = await Order.findById(data.id);

    if (!order) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Ордер не найден');
    }

    if (data.status == 'refunded') {
      await blockchainService.cancelOrder({
        coopname: config.coopname,
        income_hash: sha256(order.order_num as number),
        reason: '',
      });

      if (order.type === 'registration') {
        const user = await userService.getUserByUsername(order.username);
        user.status = userStatus['100_Refunded'];
        user.save();
      }
    }

    //обновляем статус
    order.status = orderStatus[data.status];
    await order.save();

    // Отправляем обновление через Redis, чтобы обработчик мог выполнить действия
    redisPublisher.publish(`${config.coopname}:orderStatusUpdate`, JSON.stringify({ id: data.id, status: data.status }));

    logger.info(`Статус ордера ${data.id} обновлен до ${data.status}`, { source: 'setStatus' });

    return order;
  }

  async getOrders(filter: any = {}, options: any): Promise<PaginationResultLegacy<IOrder>> {
    const orders = await Order.paginate(filter, options);
    return orders;
  }
}
