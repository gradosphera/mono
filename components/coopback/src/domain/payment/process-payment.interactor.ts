// domain/payment/interactors/ProcessPaymentInteractor.ts

import { Injectable, Logger } from '@nestjs/common';
import { Order } from '~/models';
import { userService, blockchainService } from '~/services';
import logger from '~/config/logger';
import { userStatus } from '~/types/user.types';
import { orderStatus, type IOrder } from '~/types/order.types';

@Injectable()
export class ProcessPaymentInteractor {
  private readonly logger = new Logger(ProcessPaymentInteractor.name);

  async execute(id: string, status: string) {
    const order = await Order.findById(id);

    if (!order) {
      logger.error(`Order with id ${id} not found`);
      return;
    }

    switch (status) {
      case 'paid':
        if (order.status !== 'completed') await this.processOrder(order);
        break;

      case 'failed':
        logger.warn(`Payment for order ${id} failed`);
        break;

      default:
        logger.info(`Status ${status} for order ${id} does not require processing`);
    }
  }

  private async processOrder(order: IOrder) {
    logger.info(`Processing blockchain data for order ${order.id}`);

    try {
      const user = await userService.getUserByUsername(order.username);

      if (order.type === 'registration') {
        await blockchainService.registerBlockchainAccount(user, order);
        logger.info('New user registered:', { username: user.username });

        // Обновляем пользователя
        user.status = userStatus['4_Registered'];
        user.is_registered = true;
        user.has_account = true;
        await user.save();

        // Обновляем статус заказа
        await Order.updateOne({ _id: order.id }, { status: orderStatus.completed });
      } else if (order.type === 'deposit') {
        await blockchainService.completeDeposit(order);

        // Обновляем статус заказа
        await Order.updateOne({ _id: order.id }, { status: orderStatus.completed });
        logger.info(`User ${user.username} made a share contribution of ${order.quantity}`);
      }
    } catch (e: any) {
      await Order.updateOne({ _id: order.id }, { status: orderStatus.failed, message: e.message });
      logger.error(`Error processing blockchain transaction for order: ${order.id} with message: ${e.message}`, e);
    }
  }
}
