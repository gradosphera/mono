import { defineStore } from 'pinia';
import { Ref, ref } from 'vue';
import type { IGetResponse, IOrderResponse } from '@coopenomics/controller';
import { api } from '../api';
import type { IGetCoopOrders, IGetMyOrders } from '@coopenomics/controller';


interface IPaymentStore {
  username: Ref<string | undefined>;
  orders: Ref<IGetResponse<IOrderResponse> | undefined>;
  loadCoopPayments: (params: IGetCoopOrders) => Promise<void>
  updateCoopPayments: (params: IGetCoopOrders) => Promise<void>
  loadMyPayments: (username: string, params: IGetMyOrders) => Promise<void>
  clear: () => void
}

const namespace = 'payments';

export const usePaymentStore = defineStore(namespace, (): IPaymentStore => {
  const orders: Ref<IGetResponse<IOrderResponse> | undefined> = ref();
  const username: Ref<string | undefined> = ref();

  const clear = () => {
    orders.value = undefined
  }
  // Функция для слияния массивов ордеров по id
  const mergePayments = (existingPayments: IOrderResponse[], newPayments: IOrderResponse[]) => {
    const mergedPaymentsMap = new Map(existingPayments.map(order => [order.id, order]));

    newPayments.forEach(order => {
      mergedPaymentsMap.set(order.id, order); // Обновляем или добавляем новый ордер
    });

    return Array.from(mergedPaymentsMap.values()); // Возвращаем массив объединённых ордеров
  };

  const updateCoopPayments = async(params: IGetCoopOrders): Promise<void> => {
    const newPaymentsResponse = await api.loadCoopPayments(params);

    if (orders.value)
      orders.value.results = mergePayments(orders.value.results, newPaymentsResponse.results) // Мерджим старые и новые результаты
    else orders.value = newPaymentsResponse

  }

  // Функция для загрузки всех ордеров
  const loadCoopPayments = async (params: IGetCoopOrders): Promise<void> => {
    username.value = params.username;

    const newPaymentsResponse = await api.loadCoopPayments(params);

    if (orders.value) {
      // Обновляем все свойства объекта orders
      orders.value = {
        ...orders.value, // Сохраняем старые значения limit, totalPages, totalResults и т.д.
        results: mergePayments(orders.value.results, newPaymentsResponse.results), // Мерджим старые и новые результаты
        page: newPaymentsResponse.page, // Обновляем текущую страницу
        totalPages: newPaymentsResponse.totalPages, // Обновляем общее количество страниц
        totalResults: newPaymentsResponse.totalResults, // Обновляем общее количество результатов
      };
    } else {
      orders.value = newPaymentsResponse; // Если это первая страница, просто присваиваем новый объект
    }
  };

  // Функция для загрузки собственных ордеров (по аналогии с loadAllOrders)
  const loadMyPayments = async (target: string, params: IGetMyOrders): Promise<void> => {
    username.value = target;
    const newPaymentsResponse = await api.loadMyPayments(username.value, params.page, params.limit);

    if (orders.value) {
      // Обновляем все свойства объекта orders
      orders.value = {
        ...orders.value,
        results: mergePayments(orders.value.results, newPaymentsResponse.results),
        page: newPaymentsResponse.page,
        totalPages: newPaymentsResponse.totalPages,
        totalResults: newPaymentsResponse.totalResults,
      };
    } else {
      orders.value = newPaymentsResponse;
    }
    loadMyPayments
  };

  return { username, orders, loadCoopPayments, updateCoopPayments, loadMyPayments, clear};
});
