import { defineStore } from 'pinia';
import { ref, Ref } from 'vue';
import { api } from '../api';
import type { ICyclesPagination, IGetCyclesInput } from './types';

const namespace = 'cycleStore';

interface ICycleStore {
  cycles: Ref<ICyclesPagination | null>;
  loadCycles: (data: IGetCyclesInput) => Promise<void>;
}

export const useCycleStore = defineStore(namespace, (): ICycleStore => {
  const cycles = ref<ICyclesPagination | null>(null);

  const loadCycles = async (data: IGetCyclesInput): Promise<void> => {
    const loadedData = await api.loadCycles(data);
    cycles.value = loadedData;
  };

  return {
    cycles,
    loadCycles,
  };
});
