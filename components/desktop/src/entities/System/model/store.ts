import { defineStore } from 'pinia';
import { ref, Ref, triggerRef } from 'vue';
import { api } from '../api';
import type { ISystemInfo } from '../types';
import { Zeus } from '@coopenomics/sdk';

const namespace = 'systemStore';

interface ISystemStore {
  info: Ref<ISystemInfo>;
  backendAvailable: Ref<boolean>;
  maintenanceCounter: Ref<number>;
  loadSystemInfo: () => Promise<void>;
  startSystemMonitoring: () => void;
  stopSystemMonitoring: () => void;
}

export const useSystemStore = defineStore(namespace, (): ISystemStore => {
  const info = ref<ISystemInfo>({
    system_status: 'active', // Начальное значение
  } as ISystemInfo);
  const backendAvailable = ref<boolean>(true);
  const maintenanceCounter = ref<number>(0); // Счетчик для принудительного обновления
  let monitoringInterval: ReturnType<typeof setInterval> | null = null;

  const loadSystemInfo = async () => {
    try {
      info.value = await api.loadSystemInfo();
      backendAvailable.value = true;
      triggerRef(info); // Принудительно триггерим реактивность
    } catch (error) {
      console.warn('Failed to load system info, backend might be unavailable:', error);
      backendAvailable.value = false;
      // При недоступности бэкенда устанавливаем статус обслуживания
      info.value.system_status = Zeus.SystemStatus.maintenance;
      throw error; // Перебрасываем ошибку для обработки выше
    }
  };

  const startSystemMonitoring = () => {
    // Останавливаем существующий мониторинг, если он есть
    stopSystemMonitoring();

    // Запускаем периодическую проверку каждые 10 секунд
    monitoringInterval = setInterval(async () => {
      try {
        await loadSystemInfo();
      } catch (error) {
        console.warn('Failed to update system info during monitoring:', error);
        // При недоступности бэкенда устанавливаем статус обслуживания
        backendAvailable.value = false;
        info.value.system_status = Zeus.SystemStatus.maintenance; // Обновляем статус напрямую
        maintenanceCounter.value++; // Увеличиваем счетчик для триггера watch
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
    backendAvailable,
    maintenanceCounter,
    loadSystemInfo,
    startSystemMonitoring,
    stopSystemMonitoring,
  };
});
