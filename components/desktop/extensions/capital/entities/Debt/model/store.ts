import { defineStore } from 'pinia';
import { ref, Ref } from 'vue';
import { api } from '../api';
import type {
  IDebt,
  IDebtsPagination,
  IGetDebtInput,
  IGetDebtsInput,
} from './types';

const namespace = 'debtStore';

interface IDebtStore {
  debts: Ref<IDebtsPagination | null>;
  loadDebts: (data: IGetDebtsInput) => Promise<void>;
  debt: Ref<IDebt | null>;
  loadDebt: (data: IGetDebtInput) => Promise<void>;
}

export const useDebtStore = defineStore(namespace, (): IDebtStore => {
  const debts = ref<IDebtsPagination | null>(null);
  const debt = ref<IDebt | null>(null);

  const loadDebts = async (data: IGetDebtsInput): Promise<void> => {
    const loadedData = await api.loadDebts(data);
    debts.value = loadedData;
  };

  const loadDebt = async (data: IGetDebtInput): Promise<void> => {
    const loadedData = await api.loadDebt(data);
    debt.value = loadedData;
  };

  return {
    debts,
    debt,
    loadDebts,
    loadDebt,
  };
});
