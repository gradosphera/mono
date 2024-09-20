import { PollingProviderFactory } from './payment/polling/pollingProviderFactory';
import { Order } from '../models';
import { pollingProviderNames } from './payment/polling/pollingProviderNames';
import { redisPublisher } from './redis.service';

export async function initPolling() {
  const pollingInterval = 60000;

  setInterval(async () => {
    //синхронизируем все платежи провайдеров
    for (const providerName of pollingProviderNames) {
      const provider = PollingProviderFactory.createProvider(providerName);
      await provider.sync();
    }

    // Извлекаем все заказы со статусом "pending" polling-провайдеров
    const pendingOrders = await Order.find({ status: 'pending', provider: { $in: pollingProviderNames } });

    for (const order of pendingOrders) {
      try {
        // Создаем провайдера
        const provider = PollingProviderFactory.createProvider(order.provider);

        // Проверяем, поддерживает ли провайдер Polling

        // Если да, запускаем проверку статуса через Polling
        const status = await provider.checkPaymentStatus(order.id);

        if (status === 'paid' || status === 'failed') {
          // Обновляем ордер и отправляем информацию через Redis
          await Order.updateOne({ _id: order._id }, { status });
          redisPublisher.publish('orderStatusUpdate', JSON.stringify({ orderId: order.id, status }));
        }
      } catch (error) {
        console.error(`Ошибка при опросе ордера ${order.id}:`, error);
      }
    }
  }, pollingInterval);
}
