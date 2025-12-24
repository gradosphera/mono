import { defineStore } from 'pinia';
import { ref, Ref, triggerRef, computed, ComputedRef } from 'vue';
import { api } from '../api';
import type { ISystemInfo } from '../types';
import { Zeus } from '@coopenomics/sdk';

const namespace = 'systemStore';

// Константы для экспоненциального backoff
const BASE_INTERVAL_MS = 30000; // Базовый интервал 30 секунд (было 10)
const MAX_INTERVAL_MS = 300000; // Максимальный интервал 5 минут
const BACKOFF_MULTIPLIER = 2; // Множитель для backoff

interface ISystemStore {
  info: Ref<ISystemInfo>;
  backendAvailable: Ref<boolean>;
  maintenanceCounter: Ref<number>;
  loadSystemInfo: () => Promise<void>;
  startSystemMonitoring: () => void;
  stopSystemMonitoring: () => void;
  cooperativeDisplayName: ComputedRef<string>;
}

export const useSystemStore = defineStore(namespace, (): ISystemStore => {
  const info = ref<ISystemInfo>({
    system_status: 'active', // Начальное значение
  } as ISystemInfo);
  const backendAvailable = ref<boolean>(true);
  const maintenanceCounter = ref<number>(0); // Счетчик для принудительного обновления

  let monitoringTimeout: ReturnType<typeof setTimeout> | null = null;
  let isLoading = false; // Защита от конкурентных запросов
  let currentInterval = BASE_INTERVAL_MS; // Текущий интервал (для backoff)
  let consecutiveErrors = 0; // Счетчик последовательных ошибок

  const loadSystemInfo = async () => {
    // Защита от конкурентных запросов
    if (isLoading) {
      console.debug('loadSystemInfo: запрос уже выполняется, пропускаем');
      return;
    }

    isLoading = true;
    try {
      info.value = await api.loadSystemInfo();
      backendAvailable.value = true;
      triggerRef(info); // Принудительно триггерим реактивность

      // При успехе сбрасываем backoff
      consecutiveErrors = 0;
      currentInterval = BASE_INTERVAL_MS;
    } catch (error) {
      console.warn('Failed to load system info, backend might be unavailable:', error);
      backendAvailable.value = false;
      // При недоступности бэкенда устанавливаем статус обслуживания
      info.value.system_status = Zeus.SystemStatus.maintenance;

      // Увеличиваем интервал при ошибках (экспоненциальный backoff)
      consecutiveErrors++;
      currentInterval = Math.min(
        BASE_INTERVAL_MS * Math.pow(BACKOFF_MULTIPLIER, consecutiveErrors),
        MAX_INTERVAL_MS
      );
      console.debug(`Backoff: следующая попытка через ${currentInterval / 1000} секунд`);

      throw error; // Перебрасываем ошибку для обработки выше
    } finally {
      isLoading = false;
    }
  };

  const scheduleNextCheck = () => {
    // КРИТИЧНО: Не запускаем мониторинг на сервере (SSR)
    // В SSR setInterval/setTimeout создают утечки памяти и накапливают запросы
    if (typeof window === 'undefined') {
      return;
    }

    stopSystemMonitoring();

    monitoringTimeout = setTimeout(async () => {
      try {
        await loadSystemInfo();
      } catch (error) {
        console.warn('Failed to update system info during monitoring:', error);
        // При недоступности бэкенда устанавливаем статус обслуживания
        backendAvailable.value = false;
        info.value.system_status = Zeus.SystemStatus.maintenance;
        maintenanceCounter.value++; // Увеличиваем счетчик для триггера watch
      }

      // Планируем следующую проверку с учетом возможного backoff
      scheduleNextCheck();
    }, currentInterval);
  };

  const startSystemMonitoring = () => {
    // КРИТИЧНО: Не запускаем мониторинг на сервере (SSR)
    // Это предотвращает утечку таймеров и самоDDoS
    if (typeof window === 'undefined') {
      console.debug('startSystemMonitoring: пропускаем на сервере (SSR)');
      return;
    }

    // Останавливаем существующий мониторинг, если он есть
    stopSystemMonitoring();

    // Сбрасываем backoff при явном старте мониторинга
    consecutiveErrors = 0;
    currentInterval = BASE_INTERVAL_MS;

    // Используем setTimeout вместо setInterval для гибкого управления интервалом
    scheduleNextCheck();
  };

  const stopSystemMonitoring = () => {
    if (monitoringTimeout) {
      clearTimeout(monitoringTimeout);
      monitoringTimeout = null;
    }
  };

  // Человеко-читаемое название кооператива
  const cooperativeDisplayName = computed(() => {
    const vars = info.value?.vars;
    if (vars?.short_abbr && vars?.name) {
      return `${vars.short_abbr} ${vars.name}`;
    }
    return info.value.contacts?.full_name || '';
  });

  return {
    info,
    backendAvailable,
    maintenanceCounter,
    loadSystemInfo,
    startSystemMonitoring,
    stopSystemMonitoring,
    cooperativeDisplayName,
  };
});
