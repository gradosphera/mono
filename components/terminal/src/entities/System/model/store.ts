import { defineStore } from 'pinia'
import { ref, Ref } from 'vue'
import { api } from '../api'
import type { ISystemInfo } from './types';
import type { ModelTypes } from '@coopenomics/coopjs/index';

const namespace = 'systemStore';

interface ISystemStore {
  info: Ref<ISystemInfo[]>
  loadSystemInfo: (data?: ModelTypes['GetExtensionsInput']) => void;
}

export const useSystemStore = defineStore(namespace, (): ISystemStore => {
  const info = ref<ISystemInfo[]>([])

  const loadSystemInfo = async (data?: ModelTypes['GetExtensionsInput']) => {
    info.value = await api.loadSystemInfo(data);
  };

  return {
    info,
    loadSystemInfo
  }
})
