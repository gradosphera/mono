import { ref, Ref, watch, onUnmounted } from 'vue';

/**
 * Опции для composable useDataPoller
 */
export interface UseDataPollerOptions {
  /** Интервал обновления в миллисекундах (по умолчанию 20000 = 20 сек) */
  interval?: number;
  /** Запускать poll сразу при создании (по умолчанию true) */
  immediate?: boolean;
  /** Включение/выключение poll (реактивное) */
  enabled?: Ref<boolean>;
}

/**
 * Composable для периодического обновления данных с поддержкой паузы при неактивной вкладке
 *
 * @param fetchFn - Функция для загрузки данных
 * @param options - Опции конфигурации
 * @returns Объект с методами управления poll
 */
export function useDataPoller<T>(
  fetchFn: () => Promise<T>,
  options: UseDataPollerOptions = {}
) {
  const {
    interval = 20000,
    immediate = true,
    enabled = ref(true),
  } = options;

  // Состояние polling
  const isPolling = ref(false);
  const intervalId = ref<any>(null);

  // Состояние видимости страницы
  const isPageVisible = ref(!document.hidden);

  /**
   * Обработчик изменения видимости страницы
   */
  const handleVisibilityChange = () => {
    isPageVisible.value = !document.hidden;

    if (isPageVisible.value && enabled.value && !isPolling.value) {
      // Возобновляем poll при возвращении на страницу
      startPolling();
    } else if (!isPageVisible.value && isPolling.value) {
      // Останавливаем poll при уходе со страницы
      stopPolling();
    }
  };

  /**
   * Запуск периодического обновления
   */
  const startPolling = () => {
    if (isPolling.value || !enabled.value || !isPageVisible.value) {
      return;
    }

    isPolling.value = true;

    // Немедленно выполняем первый запрос
    fetchFn().catch((error) => {
      console.warn('Poll fetch error:', error);
      // Не прерываем poll при ошибке
    });

    // Запускаем интервал
    intervalId.value = setInterval(async () => {
      if (!enabled.value || !isPageVisible.value) {
        stopPolling();
        return;
      }

      try {
        await fetchFn();
      } catch (error) {
        console.warn('Poll fetch error:', error);
        // Продолжаем poll несмотря на ошибку
      }
    }, interval);
  };

  /**
   * Остановка периодического обновления
   */
  const stopPolling = () => {
    if (intervalId.value) {
      clearInterval(intervalId.value);
      intervalId.value = null;
    }
    isPolling.value = false;
  };

  // Отслеживаем изменение enabled
  watch(enabled, (newEnabled) => {
    if (newEnabled && isPageVisible.value && !isPolling.value) {
      startPolling();
    } else if (!newEnabled && isPolling.value) {
      stopPolling();
    }
  });

  // Подписываемся на события видимости страницы
  // if (typeof document !== 'undefined') {
  //   document.addEventListener('visibilitychange', handleVisibilityChange);
  // }

  // Запускаем poll при создании, если immediate = true
  if (immediate && enabled.value && isPageVisible.value) {
    startPolling();
  }

  // Очистка при уничтожении компонента
  onUnmounted(() => {
    stopPolling();
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    }
  });

  return {
    /** Запуск polling */
    start: startPolling,
    /** Остановка polling */
    stop: stopPolling,
    /** Состояние polling (реактивное) */
    isPolling,
  };
}
