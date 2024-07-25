import { defineStore } from 'pinia';
import { ref, Ref } from 'vue';
import { api } from '../api';
import { IAddPaymentMethod, IDeletePaymentMethod, IGetPaymentMethods, IPaymentData } from './types';

interface IPaymentStore {
  //методы
  loadMethods(params: IGetPaymentMethods): Promise<void>;
  addMethod(params: IAddPaymentMethod): Promise<void>
  deleteMethod(params: IDeletePaymentMethod): Promise<void>

  paymentMethods: Ref<IPaymentData | null>
}

const namespace = 'payments';

export const useCurrentUserStore = defineStore(
  namespace,
  (): IPaymentStore => {
    const loadMethods = async(params: IGetPaymentMethods): Promise<void> => {
      paymentMethods.value = await api.loadMethods(params)
    }

    const addMethod = async(params: IAddPaymentMethod): Promise<void> => {
      await api.addMethod(params)
    }

    const deleteMethod = async(params: IDeletePaymentMethod): Promise<void> => {
      await api.deleteMethod(params)
    }

    const paymentMethods = ref<IPaymentData | null>(null)

    return {
      loadMethods,
      addMethod,
      deleteMethod,
      paymentMethods
    }
  })
