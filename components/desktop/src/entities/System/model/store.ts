import { defineStore } from 'pinia'
import { ref, Ref } from 'vue'
import { api } from '../api'
import type { ISystemInfo } from '../types';

const namespace = 'systemStore';

interface ISystemStore {
  info: Ref<ISystemInfo>
  loadSystemInfo: () => Promise<void>;
  startSystemMonitoring: () => void;
  stopSystemMonitoring: () => void;
}

export const useSystemStore = defineStore(namespace, (): ISystemStore => {
  const info = ref<ISystemInfo>({} as ISystemInfo)
  let monitoringInterval: ReturnType<typeof setInterval> | null = null;

  const loadSystemInfo = async () => {
    info.value = await api.loadSystemInfo();
  };

  const startSystemMonitoring = () => {
    // Останавливаем существующий мониторинг, если он есть
    stopSystemMonitoring();

    // Запускаем периодическую проверку каждые 10 секунд
    monitoringInterval = setInterval(async () => {
      try {
        await loadSystemInfo();
      } catch (error) {
        console.warn('Failed to update system info:', error);
      }
    }, 10000);
  };

  const stopSystemMonitoring = () => {
    if (monitoringInterval) {
      clearInterval(monitoringInterval);
      monitoringInterval = null;
    }
  };

  return {
    info,
    loadSystemInfo,
    startSystemMonitoring,
    stopSystemMonitoring
  }
})
