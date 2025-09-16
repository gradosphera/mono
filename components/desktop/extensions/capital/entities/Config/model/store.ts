import { defineStore } from 'pinia';
import { ref, Ref } from 'vue';
import { api } from '../api';
import type { IState, IGetStateInput } from './types';

const namespace = 'configStore';

interface IConfigStore {
  state: Ref<IState | null>;
  loadState: (data: IGetStateInput) => Promise<void>;
}

export const useConfigStore = defineStore(namespace, (): IConfigStore => {
  const state = ref<IState | null>(null);

  const loadState = async (data: IGetStateInput): Promise<void> => {
    const loadedData = await api.loadState(data);
    state.value = loadedData;
  };

  return {
    state,
    loadState,
  };
});
