import { defineStore } from 'pinia'
import { ref, Ref } from 'vue'
import { api } from '../api'
import { ModelTypes } from '@coopenomics/coopjs';

const namespace = 'systemStore';

interface ISystemStore {
  info: Ref<ModelTypes['SystemInfo']>
  loadSystemInfo: () => Promise<void>;
}

export const useSystemStore = defineStore(namespace, (): ISystemStore => {
  const info = ref<ModelTypes['SystemInfo']>({} as ModelTypes['SystemInfo'])

  const loadSystemInfo = async () => {
    info.value = await api.loadSystemInfo();
  };

  return {
    info,
    loadSystemInfo
  }
})
