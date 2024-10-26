import { Order } from '../models';
import { getUserByUsername } from './user.service';
import { blockchainService } from '.';
import logger from '../config/logger';
import { userStatus } from '../types/user.types';
import { orderStatus, type IOrder } from '../types/order.types';
import { redisSubscriber } from './redis.service';
import config from '../config/config';

export class PaymentEffectProcessor {
  public async processPaymentEffect(id: string, status: string) {
    const order = await Order.findById(id);

    if (!order) {
      logger.error(`Order with id ${id} not found`, { source: 'processPaymentEffect' });
      return;
    }

    switch (status) {
      case 'paid':
        if (order.status != 'completed') await this.process(order);
        break;

      case 'failed':
        logger.warn(`Payment for order ${id} failed`, { source: 'processPaymentEffect' });
        // Здесь можно добавить логику повторных попыток или обработки неуспешного платежа
        break;

      default:
        logger.info(`Status ${status} for order ${id} does not require processing`, { source: 'processPaymentEffect' });
    }
  }

  private async process(order: IOrder) {
    logger.info(`Processing blockchain data for order ${order.id}`, { source: 'process' });

    try {
      const user = await getUserByUsername(order.username);

      if (order.type === 'registration') {
        await blockchainService.registerBlockchainAccount(user, order);

        logger.info('New user registered:', { source: 'process', username: user.username });

        user.status = userStatus['4_Registered'];
        user.is_registered = true;
        user.has_account = true;
        await user.save();

        await Order.updateOne({ _id: order.id }, { status: orderStatus.completed });
      } else if (order.type === 'deposit') {
        await blockchainService.completeDeposit(order);

        await Order.updateOne({ _id: order.id }, { status: orderStatus.completed });

        logger.info(`User ${user.username} made a share contribution of ${order.quantity}`, { source: 'process' });
      }
    } catch (e: any) {
      await Order.updateOne({ _id: order.id }, { status: orderStatus.failed, message: e.message });
      logger.error(`Error processing blockchain transaction for order: ${order.id} with message: ${e.message}`, e);
    }
  }
}

export const init = () => {
  redisSubscriber.subscribe(`${config.coopname}:orderStatusUpdate`);

  redisSubscriber.on('message', async (channel, message) => {
    if (channel === `${config.coopname}:orderStatusUpdate`) {
      try {
        const { id, status } = JSON.parse(message);
        await new PaymentEffectProcessor().processPaymentEffect(id, status);
      } catch (error) {
        logger.error('Error processing Redis message:', error);
      }
    }
  });
};
