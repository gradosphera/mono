import { defineStore } from 'pinia';
import { ref, Ref } from 'vue';
import { api } from '../api';
import type { IConfig, IGetConfigInput } from './types';

const namespace = 'configStore';

interface IConfigStore {
  config: Ref<IConfig | null>;
  loadConfig: (data: IGetConfigInput) => Promise<void>;
}

export const useConfigStore = defineStore(namespace, (): IConfigStore => {
  const config = ref<IConfig | null>(null);

  const loadConfig = async (data: IGetConfigInput): Promise<void> => {
    const loadedData = await api.loadConfig(data);
    config.value = loadedData;
  };

  return {
    config,
    loadConfig,
  };
});
