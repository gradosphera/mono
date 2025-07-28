import { ref, reactive, computed, watch } from 'vue';
import { useWidgetBridge } from './use-widget-bridge';
import { widgetModeInstance } from './widget-mode';

// Проверка на существование window (для SSR)
const isClient = typeof window !== 'undefined';

// Типы событий виджета
export interface WidgetEventData {
  type: string;
  payload?: any;
  timestamp: number;
  source?: string;
}

export interface WidgetEventHandlers {
  onReady?: (data?: any) => void;
  onDataChange?: (data: any) => void;
  onError?: (error: any) => void;
  onNavigate?: (path: string) => void;
  onResize?: (dimensions: { width: number; height: number }) => void;
  onDestroy?: () => void;
}

// Глобальное состояние событий виджета
const widgetEventState = reactive({
  events: [] as WidgetEventData[],
  lastEvent: null as WidgetEventData | null,
  errorCount: 0,
  isListening: false,
});

/**
 * Композабл для работы с событиями виджета
 */
export function useWidgetEvents(handlers: WidgetEventHandlers = {}) {
  const bridge = useWidgetBridge();

  // Локальное состояние
  const eventHistory = ref<WidgetEventData[]>([]);
  const isEnabled = ref(true);

  // Регистрация обработчиков событий
  function registerEventHandlers() {
    if (!bridge.isWidget.value) return;

    // Обработчик готовности
    if (handlers.onReady) {
      bridge.on('ready', (data) => {
        const event = createEvent('ready', data);
        handleEvent(event);
        handlers.onReady?.(data);
      });
    }

    // Обработчик изменения данных
    if (handlers.onDataChange) {
      bridge.on('data-change', (data) => {
        const event = createEvent('data-change', data);
        handleEvent(event);
        handlers.onDataChange?.(data);
      });
    }

    // Обработчик ошибок
    if (handlers.onError) {
      bridge.on('error', (error) => {
        const event = createEvent('error', error);
        handleEvent(event);
        handlers.onError?.(error);
        widgetEventState.errorCount++;
      });
    }

    // Обработчик навигации
    if (handlers.onNavigate) {
      bridge.on('navigate', (path) => {
        const event = createEvent('navigate', { path });
        handleEvent(event);
        handlers.onNavigate?.(path);
      });
    }

    // Обработчик изменения размера
    if (handlers.onResize) {
      bridge.on('resize', (dimensions) => {
        const event = createEvent('resize', dimensions);
        handleEvent(event);
        handlers.onResize?.(dimensions);
      });
    }

    // Обработчик уничтожения
    if (handlers.onDestroy) {
      bridge.on('destroy', () => {
        const event = createEvent('destroy');
        handleEvent(event);
        handlers.onDestroy?.();
      });
    }
  }

  // Создание события
  function createEvent(
    type: string,
    payload?: any,
    source?: string,
  ): WidgetEventData {
    return {
      type,
      payload,
      timestamp: Date.now(),
      source: source || 'widget',
    };
  }

  // Обработка события
  function handleEvent(event: WidgetEventData) {
    if (!isEnabled.value) return;

    // Добавляем в историю
    eventHistory.value.push(event);
    widgetEventState.events.push(event);
    widgetEventState.lastEvent = event;

    // Ограничиваем размер истории
    if (eventHistory.value.length > 100) {
      eventHistory.value.shift();
    }

    if (widgetEventState.events.length > 100) {
      widgetEventState.events.shift();
    }

    // Логируем для отладки
    console.log('[Widget Events]', event);
  }

  // Отправка пользовательского события
  function emitEvent(type: string, payload?: any) {
    const event = createEvent(type, payload, 'app');
    handleEvent(event);

    // Отправляем через bridge если нужно
    if (bridge.isWidget.value) {
      bridge.sendData({ eventType: type, eventData: payload });
    }
  }

  // Очистка истории событий
  function clearEventHistory() {
    eventHistory.value = [];
    widgetEventState.events = [];
    widgetEventState.lastEvent = null;
    widgetEventState.errorCount = 0;
  }

  // Получение событий по типу
  function getEventsByType(type: string): WidgetEventData[] {
    return eventHistory.value.filter((event) => event.type === type);
  }

  // Получение последнего события по типу
  function getLastEventByType(type: string): WidgetEventData | null {
    const events = getEventsByType(type);
    return events.length > 0 ? events[events.length - 1] : null;
  }

  // Статистика событий
  const eventStats = computed(() => {
    const stats: Record<string, number> = {};
    eventHistory.value.forEach((event) => {
      stats[event.type] = (stats[event.type] || 0) + 1;
    });
    return stats;
  });

  // Инициализация
  registerEventHandlers();

  return {
    // Состояние
    eventHistory,
    isEnabled,
    eventStats,
    errorCount: computed(() => widgetEventState.errorCount),
    lastEvent: computed(() => widgetEventState.lastEvent),

    // Методы
    emitEvent,
    clearEventHistory,
    getEventsByType,
    getLastEventByType,
    handleEvent,
  };
}

/**
 * Интеграция с Vue Router для отслеживания навигации
 */
export function useWidgetRouterIntegration() {
  const bridge = useWidgetBridge();

  // Программная навигация из виджета
  function navigateToRoute(path: string) {
    if (bridge.isWidget.value) {
      console.log('Navigate to route:', path);
      // Здесь можно добавить логику навигации
    }
  }

  return {
    navigateToRoute,
  };
}

/**
 * Интеграция с Pinia для отслеживания состояния
 */
export function useWidgetStateIntegration() {
  const bridge = useWidgetBridge();

  // Отслеживание изменений состояния
  function watchStore(store: any, key: string) {
    if (!bridge.isWidget.value) return;

    watch(
      () => store[key],
      (newValue) => {
        if (bridge.isReady.value) {
          bridge.sendData({
            type: 'state-change',
            storeKey: key,
            value: newValue,
          });
        }
      },
      { deep: true },
    );
  }

  // Отправка текущего состояния
  function sendCurrentState(data: any) {
    if (bridge.isWidget.value && bridge.isReady.value) {
      bridge.sendData({
        type: 'current-state',
        data,
      });
    }
  }

  return {
    watchStore,
    sendCurrentState,
  };
}

/**
 * Обработчики специфичных событий приложения
 */
export function useWidgetAppEvents() {
  const bridge = useWidgetBridge();

  // Обработка ошибок Vue
  function handleVueError(error: any, instance: any, info: string) {
    if (bridge.isWidget.value && bridge.isReady.value) {
      bridge.sendError({
        type: 'vue-error',
        message: error.message,
        stack: error.stack,
        info,
        component: instance?.$options.name || 'Unknown',
      });
    }
  }

  // Обработка ошибок JavaScript
  function handleJSError(error: ErrorEvent) {
    if (bridge.isWidget.value && bridge.isReady.value) {
      bridge.sendError({
        type: 'js-error',
        message: error.message,
        filename: error.filename,
        lineno: error.lineno,
        colno: error.colno,
        stack: error.error?.stack,
      });
    }
  }

  // Обработка отклоненных промисов
  function handleUnhandledRejection(event: PromiseRejectionEvent) {
    if (bridge.isWidget.value && bridge.isReady.value) {
      bridge.sendError({
        type: 'unhandled-rejection',
        reason: event.reason,
        stack: event.reason?.stack,
      });
    }
  }

  // Установка глобальных обработчиков
  function setupGlobalErrorHandlers() {
    if (!isClient) return;

    window.addEventListener('error', handleJSError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
  }

  // Очистка обработчиков
  function cleanupGlobalErrorHandlers() {
    if (!isClient) return;

    window.removeEventListener('error', handleJSError);
    window.removeEventListener('unhandledrejection', handleUnhandledRejection);
  }

  return {
    handleVueError,
    handleJSError,
    handleUnhandledRejection,
    setupGlobalErrorHandlers,
    cleanupGlobalErrorHandlers,
  };
}

/**
 * Глобальный менеджер событий виджета
 */
export class WidgetEventManager {
  private static instance: WidgetEventManager | null = null;
  private isInitialized = false;

  // Приватный конструктор для Singleton
  private constructor() {
    // Инициализация в getInstance
  }

  public static getInstance(): WidgetEventManager {
    if (!WidgetEventManager.instance) {
      WidgetEventManager.instance = new WidgetEventManager();
    }
    return WidgetEventManager.instance;
  }

  public initialize() {
    if (this.isInitialized || !isClient) return;

    const widgetMode = widgetModeInstance.getState();

    if (widgetMode.isWidget.value) {
      const appEvents = useWidgetAppEvents();
      appEvents.setupGlobalErrorHandlers();

      console.log('[Widget Event Manager] Initialized');
      this.isInitialized = true;
    }
  }

  public destroy() {
    if (!this.isInitialized || !isClient) return;

    const appEvents = useWidgetAppEvents();
    appEvents.cleanupGlobalErrorHandlers();

    console.log('[Widget Event Manager] Destroyed');
    this.isInitialized = false;
  }
}

// Экспорт singleton
export const widgetEventManager = WidgetEventManager.getInstance();
