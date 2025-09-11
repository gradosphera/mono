import { defineStore } from 'pinia';
import { ref, Ref } from 'vue';
import { api } from '../api';
import type {
  IInvest,
  IInvestsPagination,
  IGetInvestInput,
  IGetInvestsInput,
} from './types';

const namespace = 'investStore';

interface IInvestStore {
  invests: Ref<IInvestsPagination | null>;
  loadInvests: (data: IGetInvestsInput) => Promise<void>;
  invest: Ref<IInvest | null>;
  loadInvest: (data: IGetInvestInput) => Promise<void>;
}

export const useInvestStore = defineStore(namespace, (): IInvestStore => {
  const invests = ref<IInvestsPagination | null>(null);
  const invest = ref<IInvest | null>(null);

  const loadInvests = async (data: IGetInvestsInput): Promise<void> => {
    const loadedData = await api.loadInvests(data);
    invests.value = loadedData;
  };

  const loadInvest = async (data: IGetInvestInput): Promise<void> => {
    const loadedData = await api.loadInvest(data);
    invest.value = loadedData;
  };

  return {
    invests,
    invest,
    loadInvests,
    loadInvest,
  };
});
