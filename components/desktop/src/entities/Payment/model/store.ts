import { defineStore } from 'pinia';
import { Ref, ref } from 'vue';
import { api } from '../api';
import type { IGetPaymentsInputData, IGetPaymentsInputOptions, IPayment, IPaymentPaginationResult } from './types';

interface IPaymentStore {
  payments: Ref<IPaymentPaginationResult | undefined>;
  loadPayments: (data?: IGetPaymentsInputData, options?: IGetPaymentsInputOptions) => Promise<void>;
  updatePayments: (data?: IGetPaymentsInputData, options?: IGetPaymentsInputOptions) => Promise<void>;
  clear: () => void;
}

const namespace = 'payments';

export const usePaymentStore = defineStore(namespace, (): IPaymentStore => {
  const payments: Ref<IPaymentPaginationResult | undefined> = ref();

  const clear = () => {
    payments.value = undefined;
  };

  // Функция для слияния массивов платежей по id
  const mergePayments = (existingPayments: IPayment[], newPayments: IPayment[]) => {
    const mergedPaymentsMap = new Map(existingPayments.map(payment => [payment.id, payment]));

    newPayments.forEach(payment => {
      mergedPaymentsMap.set(payment.id, payment); // Обновляем или добавляем новый платеж
    });

    return Array.from(mergedPaymentsMap.values()); // Возвращаем массив объединённых платежей
  };

  const updatePayments = async(data?: IGetPaymentsInputData, options?: IGetPaymentsInputOptions): Promise<void> => {
    const newPaymentsResponse = await api.loadPayments(data, options);

    if (payments.value) {
      payments.value.items = mergePayments(payments.value.items, newPaymentsResponse.items);
    } else {
      payments.value = newPaymentsResponse;
    }
  };

  // Функция для загрузки платежей
  const loadPayments = async (data?: IGetPaymentsInputData, options?: IGetPaymentsInputOptions): Promise<void> => {
    const newPaymentsResponse = await api.loadPayments(data, options);

    if (payments.value) {
      // Обновляем все свойства объекта payments
      payments.value = {
        ...payments.value,
        items: mergePayments(payments.value.items, newPaymentsResponse.items),
        currentPage: newPaymentsResponse.currentPage,
        totalPages: newPaymentsResponse.totalPages,
        totalCount: newPaymentsResponse.totalCount
      };
    } else {
      payments.value = newPaymentsResponse;
    }
  };

  return { payments, loadPayments, updatePayments, clear };
});
