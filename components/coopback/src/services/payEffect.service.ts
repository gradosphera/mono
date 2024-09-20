import { Order } from '../models';
import { getUserByUsername } from './user.service';
import { blockchainService } from '.';
import logger from '../config/logger';
import { userStatus } from '../models/user.model';
import type { IOrder } from '../models/order.model';
import { redisSubscriber } from './redis.service';

export class PaymentEffectProcessor {
  static async processPaymentEffect(orderId: string, status: string) {
    const order = await Order.findById(orderId);

    if (!order) {
      logger.error(`Order with id ${orderId} not found`, { source: 'processPaymentEffect' });
      return;
    }

    switch (status) {
      case 'paid':
        if (order.status != 'completed') await PaymentEffectProcessor.process(order);
        break;

      case 'failed':
        logger.warn(`Payment for order ${orderId} failed`, { source: 'processPaymentEffect' });
        // Здесь можно добавить логику повторных попыток или обработки неуспешного платежа
        break;

      default:
        logger.info(`Status ${status} for order ${orderId} does not require processing`, { source: 'processPaymentEffect' });
    }
  }

  private static async process(order: IOrder) {
    logger.info(`Processing blockchain data for order ${order.id}`, { source: 'process' });

    try {
      const user = await getUserByUsername(order.username);

      if (order.type === 'registration') {
        await blockchainService.registerBlockchainAccount(user, order);

        logger.info('New user registered:', { source: 'process', username: user.username });

        user.status = userStatus['4_Registered'];
        user.is_registered = true;
        await user.save();

        await Order.updateOne({ _id: order.id }, { status: 'completed' });
      } else if (order.type === 'deposit') {
        await blockchainService.completeDeposit(order);

        await Order.updateOne({ _id: order.id }, { status: 'completed' });

        logger.info(`User ${user.username} made a share contribution of ${order.quantity}`, { source: 'process' });
      }
    } catch (e: any) {
      await Order.updateOne({ _id: order.id }, { status: 'failed', message: e.message });
      logger.error(`Error processing blockchain transaction for order: ${order.id} with message: ${e.message}`, e);
    }
  }
}

redisSubscriber.subscribe('orderStatusUpdate');

redisSubscriber.on('message', async (channel, message) => {
  if (channel === 'orderStatusUpdate') {
    try {
      const { orderId, status } = JSON.parse(message);
      await PaymentEffectProcessor.processPaymentEffect(orderId, status);
    } catch (error) {
      logger.error('Error processing Redis message:', error);
    }
  }
});
