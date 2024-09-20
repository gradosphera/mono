import { Order } from '../models/index';
import mongoose from 'mongoose';
import { getUserByUsername } from './user.service';
import logger from '../config/logger';
import { ICreateDeposit, ICreateInitialPayment } from '../types';
import { generator } from './document.service';
import { ICreatedPayment } from '../types/common';
import { ProviderFactory } from './payment/providerFactory';
import type { IOrder } from '../models/order.model';
import ApiError from '../utils/ApiError';
import httpStatus from 'http-status';
import { redisPublisher } from './redis.service';
import crypto from 'crypto';
import Settings from '../models/settings.model';

export async function createOrder(
  username: string,
  providerName: string,
  type: 'deposit' | 'registration',
  amount: string
): Promise<ICreatedPayment> {
  const cooperative = await generator.constructCooperative(process.env.COOPNAME as string);

  if (!cooperative) throw new Error('Кооператив не найден');

  const session = await mongoose.startSession();
  let result;
  try {
    await session.withTransaction(async () => {
      // Создание ордера
      const order: IOrder = {
        creator: process.env.COOPNAME as string,
        secret: generateOrderSecret(),
        status: 'pending',
        type: type,
        provider: providerName,
        username,
        quantity: amount,
      };

      const db_order = new Order(order);

      await db_order.save({ session });

      const secret = db_order.secret;

      const provider = ProviderFactory.createProvider(providerName);

      const paymentDetails = await provider.createPayment(
        amount,
        type === 'deposit' ? 'Паевый взнос' : 'Регистрационный взнос',
        secret
      );

      logger.info('Order created', { type, username, provider, amount, source: 'createDeposit' });

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

export function checkPaymentAmount(incomeAmount, expectedAmount, tolerancePercentage) {
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

export async function setStatus(orderId: string, status: string) {
  const order = await Order.findById(orderId);

  if (!order) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Ордер не найден');
  }

  // Обновляем статус ордера в базе данных
  await Order.updateOne({ _id: orderId }, { status });

  // Отправляем обновление через Redis, чтобы обработчик мог выполнить действия
  redisPublisher.publish('orderStatusUpdate', JSON.stringify({ orderId, status }));

  logger.info(`Статус ордера ${orderId} обновлен до ${status}`, { source: 'setStatus' });
}

export async function getOrders(filter, options) {
  const orders = await Order.paginate(filter, options);
  return orders;
}
