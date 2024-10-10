import { Order, User } from '../models/index';
import mongoose, { type ObjectId } from 'mongoose';
import { getUserByUsername } from './user.service';
import logger from '../config/logger';
import { ICreateDeposit, ICreateInitialPayment, type IBCAction } from '../types';
import { generator } from './document.service';
import { ICreatedPayment } from '../types';
import { ProviderFactory } from './payment/providerFactory';
import { orderStatus, type IOrder } from '../types/order.types';
import ApiError from '../utils/ApiError';
import httpStatus from 'http-status';
import { redisPublisher } from './redis.service';
import crypto from 'crypto';
import Settings from '../models/settings.model';
import _ from 'lodash'; // lodash для глубокого клонирования
import { blockchainService, userService } from '.';
import config from '../config/config';
import { GatewayContract } from 'cooptypes';
import { userStatus } from '../types/user.types';

export async function createOrder(
  username: string,
  providerName: string,
  type: 'deposit' | 'registration',
  amount: string
): Promise<ICreatedPayment> {
  const cooperative = await generator.constructCooperative(process.env.COOPNAME as string);

  if (!cooperative) throw new Error('Кооператив не найден');

  const session = await mongoose.startSession();

  const [, symbol] = amount.split(' ');

  let result;
  try {
    await session.withTransaction(async () => {
      const user = await getUserByUsername(username);
      let db_order;
      console.log('user.initial_order', user.initial_order);

      if (type === 'registration' && user.initial_order) {
        db_order = await Order.findOne({ _id: user.initial_order }); //add expiration
      }

      if (!db_order) {
        db_order = new Order({
          creator: process.env.COOPNAME as string,
          secret: generateOrderSecret(),
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

      const provider = ProviderFactory.createProvider(providerName);

      const paymentDetails = await provider.createPayment(
        amount,
        symbol,
        type === 'deposit'
          ? `Добровольный паевый взнос №${db_order.order_num}`
          : `Добровольный вступительный и минимальный паевый взнос №${secret}`,
        db_order.order_num as number,
        secret
      );

      db_order.details = paymentDetails;

      await db_order.save({ session });

      logger.info('Order created', { providerName, type, username, provider, amount, source: 'createDeposit' });

      result = { provider: providerName, details: paymentDetails };
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    logger.error(`Error happen on createOrder process: ${e.message}`);
    throw e;
  }
  return result;
}

export async function createDeposit(username: string, data: ICreateDeposit): Promise<ICreatedPayment> {
  const cooperative = await generator.constructCooperative(process.env.COOPNAME as string);
  if (!cooperative) throw new Error('Кооператив не найден');

  const [, symbol_initial] = cooperative.initial.split(' ');

  const [amount, symbol] = data.quantity.split(' ');
  const quantity = `${parseFloat(amount).toFixed(4)} ${symbol}`;
  if (symbol_initial != symbol) throw new ApiError(httpStatus.BAD_REQUEST, 'Неверный символ для платежа');

  const provider = (await Settings.getSettings()).provider.name;

  return createOrder(username, provider, 'deposit', quantity);
}

export async function createInitialOrder(username: string): Promise<ICreatedPayment> {
  const cooperative = await generator.constructCooperative(process.env.COOPNAME as string);
  if (!cooperative) throw new Error('Кооператив не найден');

  const user = await getUserByUsername(username);

  let amount = '';

  if (user.type === 'individual' || user.type === 'entrepreneur') {
    amount = cooperative.registration;
  } else {
    amount = cooperative.org_registration;
  }

  const provider = (await Settings.getSettings()).provider.name;

  return createOrder(username, provider, 'registration', amount);
}

export function checkPaymentSymbol(incomeSymbol: string, extectedSymbol: string) {
  if (incomeSymbol != extectedSymbol) return { status: 'error', message: `${incomeSymbol} != expectedSymbol` };
  else return { status: 'success', message: '' };
}

export function checkPaymentAmount(incomeAmount: string, expectedAmount: string, tolerancePercentage: number) {
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

export function generateOrderSecret(length = 16): string {
  return crypto.randomBytes(length).toString('hex'); // Генерирует случайный секрет в виде hex-строки
}

export function getAmountPlusFee(amount: number, fee: number): number {
  if (fee < 0 || fee >= 100) {
    throw new Error('Fee must be between 0 and 100.');
  }
  return amount / ((100 - fee) / 100);
}

export async function setStatus(id: string, status: string) {
  const order = await Order.findById(id);

  if (!order) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Ордер не найден');
  }

  if (status == 'refunded') {
    await blockchainService.cancelOrder({
      coopname: config.coopname,
      admin: config.coopname,
      deposit_id: order.order_num as number,
      memo: '',
    });

    if (order.type === 'registration') {
      const user = await userService.getUserByUsername(order.username);
      user.status = userStatus['100_Refunded'];
      user.save();
    }
  }

  //обновляем статус
  order.status = orderStatus[status];
  await order.save();

  // Отправляем обновление через Redis, чтобы обработчик мог выполнить действия
  redisPublisher.publish(`${config.coopname}:orderStatusUpdate`, JSON.stringify({ id, status }));

  logger.info(`Статус ордера ${id} обновлен до ${status}`, { source: 'setStatus' });
}

export async function getOrders(filter, options) {
  const orders = await Order.paginate(filter, options);
  return orders;
}
