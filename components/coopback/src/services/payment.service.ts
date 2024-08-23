import { Order, Token } from '../models/index';
import { getCooperative } from './blockchain.service';
import { YooCheckout, ICreatePayment } from '@a2seven/yoo-checkout';
import mongoose from 'mongoose';
import { getUserByUsername } from './user.service';
import * as blockchainService from './blockchain.service';
import logger from '../config/logger';
import { ICreateDeposit, ICreateInitialPayment } from '../types';
import { generator } from './document.service';
import ApiError from '../utils/ApiError';
import httpStatus from 'http-status';
import { ICreatedPayment, IYandexIPN, PaymentDetails } from '../types/common';
import { Cooperative } from 'cooptypes';
import { FilterQuery } from 'mongoose';

const { connection } = mongoose;

export const savePaymentMethod = async (data: Cooperative.Payments.IPaymentData) => {
  return await generator.save('paymentMethod', data);
};

export const deletePaymentMethod = async (filter: FilterQuery<Cooperative.Payments.IPaymentData>) => {
  return await generator.del('paymentMethod', filter as any);
};

export const listPaymentMethods = async (filter: FilterQuery<Cooperative.Payments.IPaymentData>) => {
  return await generator.list('paymentMethod', filter as any);
};

function getAmountPlusFee(amount: number, provider: string): number {
  const matrix = {
    yookassa: 3.5,
  };

  const fee = matrix[provider];

  if (!fee) throw new Error('Неизвестный провайдер');

  return amount / ((100 - fee) / 100);
}

export async function createDeposit(username: string, data: ICreateDeposit): Promise<ICreatedPayment> {
  const cooperative = await generator.constructCooperative(process.env.COOPNAME as string);

  if (!cooperative) throw new Error('Кооператив не найден');

  // 1. Создаёшь ордер в базе и получаешь внутренний айди
  const db_order = await Order.create({
    creator: process.env.COOPNAME,
    type: 'deposit',
    data: { username, provider: data.provider, quantity: data.quantity },
  });
  const internal_id = db_order.id;

  let order_id = 0;

  const [, symbol_initial] = cooperative.initial.split(' ');
  const [amount, symbol] = data.quantity.split(' ');

  if (symbol_initial != symbol) throw new Error('Неверный символ для платежа');

  let paymentDetails = {} as PaymentDetails; // Инициализация переменной для деталей

  if (data.provider === 'yookassa') {
    // 2. Используешь внутренний айди для получения ордера в системе платежей
    const checkout = new YooCheckout({
      shopId: process.env.YA_SHOP_ID as string,
      secretKey: process.env.YA_SHOP_SECRET as string,
      token: process.env.YA_ACCESS_TOKEN as string,
    });

    const amount_plus_fee = getAmountPlusFee(parseFloat(amount), data.provider);

    const payment = await checkout.createPayment(
      {
        description: 'Паевый взнос',
        amount: {
          value: amount_plus_fee.toFixed(2),
          currency: 'RUB',
        },
        confirmation: {
          type: 'embedded',
        },
        metadata: {
          internal_id: internal_id,
        },
        capture: true,
      },
      internal_id
    );

    paymentDetails = {
      url: '',
      token: payment?.confirmation?.confirmation_token || '',
    };

    if (!paymentDetails.token)
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        'Возникла проблема при получении платежного токена. Пожалуйста, повторите позже.'
      );

    // 3. Используешь ссылку для создания ордера по блокчейну
    const order = {
      coopname: process.env.COOPNAME,
      username: username,
      type: 'deposit',
      quantity: data.quantity,
    };

    order_id = await blockchainService.createOrder(order);

    // 4. Обновляешь ордер идентификатором ордера в блокчейне (order_id)
    await Order.updateOne({ _id: internal_id }, { order_id });
  }

  return { order_id, provider: data.provider, details: paymentDetails };
}

export async function createInitialOrder(username: string, data: ICreateInitialPayment): Promise<ICreatedPayment> {
  const cooperative = await generator.constructCooperative(process.env.COOPNAME as string);

  if (!cooperative) throw new ApiError(httpStatus.BAD_REQUEST, 'Кооператив не найден');

  const user = await getUserByUsername(username);
  let amount = '';

  if (user.type === 'individual' || user.type === 'entrepreneur') amount = cooperative.registration;
  else amount = cooperative.org_registration;

  const [, symbol] = cooperative.initial.split(' ');
  let order_id = 0;

  let paymentDetails = {} as PaymentDetails; // Инициализация переменной для деталей

  // 1. Создаёшь ордер в базе и получаешь внутренний айди
  const db_order = await Order.create({
    creator: process.env.COOPNAME,
    type: 'registration',
    data: { provider: data.provider, username, quantity: amount },
  });
  const internal_id = db_order.id;

  if (data.provider === 'yookassa') {
    // 2. Используешь внутренний айди для получения ордера в системе платежей
    const checkout = new YooCheckout({
      shopId: process.env.YA_SHOP_ID as string,
      secretKey: process.env.YA_SHOP_SECRET as string,
      token: process.env.YA_ACCESS_TOKEN as string,
    });

    const amount_plus_fee = getAmountPlusFee(parseFloat(amount), data.provider);

    const payment = await checkout.createPayment(
      {
        description: 'Регистрационный взнос',
        amount: {
          value: amount_plus_fee.toFixed(2),
          currency: 'RUB',
        },
        confirmation: {
          type: 'embedded',
        },
        metadata: {
          internal_id: internal_id,
        },
        capture: true,
      },
      internal_id
    );

    paymentDetails = {
      url: '',
      token: payment?.confirmation?.confirmation_token || '',
    };

    if (!paymentDetails.token)
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        'Возникла проблема при получении платежного токена. Пожалуйста, повторите позже.'
      );

    // 3. Используешь ссылку для создания ордера по блокчейну
    const order = {
      coopname: process.env.COOPNAME,
      username: username,
      type: 'registration',
      quantity: amount,
    };

    order_id = await blockchainService.createOrder(order);

    // 4. Обновляешь ордер идентификатором ордера в блокчейне (order_id)
    await Order.updateOne({ _id: internal_id }, { order_id });
  }

  return { order_id, provider: data.provider, details: paymentDetails };
}

export async function catchIPN(ipnBody: IYandexIPN) {
  if (!connection.db) throw new Error('Нет подключения');

  const payments = await connection.db.collection('payments');

  const exist = await payments.findOne({ 'object.id': ipnBody.object.id });

  if (!exist) {
    await payments.insertOne(ipnBody);
    const { internal_id } = ipnBody.object.metadata;
    const order = await Order.findOne({ _id: internal_id });

    if (order) {
      if (ipnBody.event === 'payment.succeeded') {
        order.payed = true;

        const tolerancePercentage = 0.1; // Допустимая погрешность в процентах
        const tolerance = parseFloat(order.data.quantity) * (tolerancePercentage / 100); // Абсолютное значение погрешности

        if (parseFloat(ipnBody.object.income_amount.value) < parseFloat(order.data.quantity) - tolerance) {
          order.error = {
            message: `Недостаточно средств, поступило: ${ipnBody.object.income_amount.value} ожидается: ${order.data.quantity}`,
          };
          order.delivered = false;
          await order.save();
          return;
        }

        await order.save();

        const user = await getUserByUsername(order.data.username);

        try {
          if (!user) throw new Error(`Пользователь не найден ${order.data.username}`);

          if (order.type === 'registration') {
            await blockchainService.registerBlockchainAccount(user, {
              coopname: process.env.COOPNAME as string,
              admin: process.env.COOPNAME as string,
              deposit_id: order.order_id as number,
              memo: '',
            });

            logger.info('Зарегистрирован новый пользователь: ', user.username);
            user.status = 'registered';
            user.is_registered = true;
          } else if (order.type === 'deposit') {
            await blockchainService.completeOrder({
              coopname: process.env.COOPNAME as string,
              admin: process.env.COOPNAME as string,
              deposit_id: order.order_id as number,
              memo: '',
            });
            const quantity = parseFloat(order.data.quantity);
            logger.info(`Принят паевый взнос пользователя: ${user.username} на сумму ${order.data.quantity}`);
          }

          await user.save();

          order.delivered = true;
          await order.save();
        } catch (e: any) {
          logger.warn(e);
          order.error = e;
          order.delivered = false;
          await order.save();

          await blockchainService.failOrder({
            coopname: process.env.COOPNAME,
            admin: process.env.COOPNAME,
            deposit_id: order.order_id,
            memo: '',
          });

          user.status = 'failed';
          user.message = e.message;
          await user.save();
        }
      } else if (ipnBody.event === 'payment.canceled') {
        await blockchainService.failOrder({
          coopname: process.env.COOPNAME,
          admin: process.env.COOPNAME,
          deposit_id: order.order_id,
          memo: '',
        });
      }
    } else {
      logger.warn(`Ордер не найден: `, ipnBody);
      throw new Error(`Ордер не найден`);
    }
  }
}
