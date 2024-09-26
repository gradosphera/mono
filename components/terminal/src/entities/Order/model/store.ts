import { defineStore } from 'pinia';
import { Ref, ref } from 'vue';
import type { IGetResponse, IOrderResponse } from 'coopback';
import { api } from '../api';
import { IGetCoopOrders, IGetMyOrders } from 'coopback';


interface IOrderStore {
  username: Ref<string | undefined>;
  orders: Ref<IGetResponse<IOrderResponse> | undefined>;
  loadCoopOrders: (params: IGetCoopOrders) => Promise<void>
  updateCoopOrders: (params: IGetCoopOrders) => Promise<void>
  loadMyOrders: (username: string, params: IGetMyOrders) => Promise<void>
  clear: () => void
}

const namespace = 'orders';

export const useOrderStore = defineStore(namespace, (): IOrderStore => {
  const orders: Ref<IGetResponse<IOrderResponse> | undefined> = ref();
  const username: Ref<string | undefined> = ref();

  const clear = () => {
    orders.value = undefined
  }
  // Функция для слияния массивов ордеров по id
  const mergeOrders = (existingOrders: IOrderResponse[], newOrders: IOrderResponse[]) => {
    const mergedOrdersMap = new Map(existingOrders.map(order => [order.id, order]));

    newOrders.forEach(order => {
      mergedOrdersMap.set(order.id, order); // Обновляем или добавляем новый ордер
    });

    return Array.from(mergedOrdersMap.values()); // Возвращаем массив объединённых ордеров
  };

  const updateCoopOrders = async(params: IGetCoopOrders): Promise<void> => {
    const newOrdersResponse = await api.loadCoopOrders(params);

    console.log('newOrdersResponse: ', newOrdersResponse)

    if (orders.value)
      orders.value.results = mergeOrders(orders.value.results, newOrdersResponse.results) // Мерджим старые и новые результаты
    else orders.value = newOrdersResponse

  }

  // Функция для загрузки всех ордеров
  const loadCoopOrders = async (params: IGetCoopOrders): Promise<void> => {
    username.value = params.username;

    const newOrdersResponse = await api.loadCoopOrders(params);

    if (orders.value) {
      // Обновляем все свойства объекта orders
      orders.value = {
        ...orders.value, // Сохраняем старые значения limit, totalPages, totalResults и т.д.
        results: mergeOrders(orders.value.results, newOrdersResponse.results), // Мерджим старые и новые результаты
        page: newOrdersResponse.page, // Обновляем текущую страницу
        totalPages: newOrdersResponse.totalPages, // Обновляем общее количество страниц
        totalResults: newOrdersResponse.totalResults, // Обновляем общее количество результатов
      };
    } else {
      orders.value = newOrdersResponse; // Если это первая страница, просто присваиваем новый объект
    }
  };

  // Функция для загрузки собственных ордеров (по аналогии с loadAllOrders)
  const loadMyOrders = async (target: string, params: IGetMyOrders): Promise<void> => {
    username.value = target;
    const newOrdersResponse = await api.loadMyOrders(username.value, params.page, params.limit);

    if (orders.value) {
      // Обновляем все свойства объекта orders
      orders.value = {
        ...orders.value,
        results: mergeOrders(orders.value.results, newOrdersResponse.results),
        page: newOrdersResponse.page,
        totalPages: newOrdersResponse.totalPages,
        totalResults: newOrdersResponse.totalResults,
      };
    } else {
      orders.value = newOrdersResponse;
    }
    loadMyOrders
  };

  return { username, orders, loadCoopOrders, updateCoopOrders, loadMyOrders, clear};
});
