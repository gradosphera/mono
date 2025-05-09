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
    logger.info(`NOT Processing blockchain data for order ${order.id}`);
  }
}
// export const init = () => {
//   redisSubscriber.subscribe(`${config.coopname}:orderStatusUpdate`);

//   redisSubscriber.on('message', async (channel, message) => {
//     if (channel === `${config.coopname}:orderStatusUpdate`) {
//       try {
//         const { id, status } = JSON.parse(message);
//         await new PaymentEffectProcessor().processPaymentEffect(id, status);
//       } catch (error) {
//         logger.error('Error processing Redis message:', error);
//       }
//     }
//   });
// };

// export const providers: Record<string, any> = {};

// export const registerProvider = (name: string, providerInstance: any) => {
//   providers[name] = providerInstance;
// };

// export const getProvider = (name: string) => {
//   return providers[name];
// };
