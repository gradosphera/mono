import { usePaymentStore } from 'src/entities/Payment/model';
import { api } from '../api';
import { Zeus } from '@coopenomics/sdk';

export const useSetStatus = () => {
  const paymentStore = usePaymentStore();

  const setPaidStatus = async (id: string) => {
    const result = await api.setPaymentStatus({
      id,
      status: Zeus.PaymentStatus.PAID,
    });

    // Загружаем обновленный платеж по хэшу через некоторое время
    setTimeout(async () => {
      try {
        await paymentStore.loadPayments({ hash: result.hash });
      } catch (e) {
        console.error('Ошибка при обновлении платежа:', e);
      }
    }, 1000);

    return result;
  };

  const setRefundedStatus = async (id: string) => {
    const result = await api.setPaymentStatus({
      id,
      status: Zeus.PaymentStatus.REFUNDED,
    });

    // Загружаем обновленный платеж по хэшу через некоторое время
    setTimeout(async () => {
      try {
        await paymentStore.loadPayments({ hash: result.hash });
      } catch (e) {
        console.error('Ошибка при обновлении платежа:', e);
      }
    }, 1000);

    return result;
  };

  const setCompletedStatus = async (id: string) => {
    const result = await api.setPaymentStatus({
      id,
      status: Zeus.PaymentStatus.COMPLETED,
    });

    // Загружаем обновленный платеж по хэшу через некоторое время
    setTimeout(async () => {
      try {
        await paymentStore.loadPayments({ hash: result.hash });
      } catch (e) {
        console.error('Ошибка при обновлении платежа:', e);
      }
    }, 1000);

    return result;
  };

  return { setPaidStatus, setRefundedStatus, setCompletedStatus };
};
