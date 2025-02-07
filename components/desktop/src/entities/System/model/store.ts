import { defineStore } from 'pinia'
import { ref, Ref } from 'vue'
import { api } from '../api'
import type { ISystemInfo } from '../types';

const namespace = 'systemStore';

interface ISystemStore {
  info: Ref<ISystemInfo>
  loadSystemInfo: () => Promise<void>;
}

export const useSystemStore = defineStore(namespace, (): ISystemStore => {
  const info = ref<ISystemInfo>({} as ISystemInfo)
  console.log('system: ', info)
  const loadSystemInfo = async () => {
    info.value = await api.loadSystemInfo();
  };

  return {
    info,
    loadSystemInfo
  }
})
