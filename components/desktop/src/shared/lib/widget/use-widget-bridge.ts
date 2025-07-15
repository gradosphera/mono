import { ref, reactive, onMounted, onUnmounted } from 'vue';
import { PostMessageBridge } from './postmessage-bridge';
import { IWidgetConfig, DEFAULT_WIDGET_CONFIG } from 'src/shared/config/widget';

// Проверка на существование window (для SSR)
const isClient = typeof window !== 'undefined';

export function useWidgetBridge(initialConfig?: Partial<IWidgetConfig>) {
  // Реактивные данные
  const isReady = ref(false);
  const isWidget = ref(false);
  const widgetData = ref<any>(null);
  const config = reactive<IWidgetConfig>({
    ...DEFAULT_WIDGET_CONFIG,
    ...initialConfig,
  });

  let bridge: PostMessageBridge | null = null;

  // Проверяем, работаем ли мы в iframe
  function checkIfWidget(): boolean {
    return isClient && window.parent !== window;
  }

  // Инициализация bridge
  function initBridge() {
    if (!isClient) return;

    if (checkIfWidget()) {
      isWidget.value = true;
      bridge = new PostMessageBridge(config);

      // Подписываемся на события
      bridge.on('ready', (data) => {
        isReady.value = true;
        if (data) {
          widgetData.value = data;
        }
      });

      bridge.on('data-change', (data) => {
        widgetData.value = data;
      });

      bridge.on('config-change', (newConfig) => {
        Object.assign(config, newConfig);
      });

      bridge.on('navigate', (path) => {
        // Обрабатываем навигацию
        navigateToPath(path);
      });

      bridge.on('destroy', () => {
        cleanup();
      });
    }
  }

  // Навигация
  function navigateToPath(path: string) {
    if (!isClient) return;

    // Здесь можно использовать Vue Router
    console.log('Navigate to:', path);
    // router.push(path);
  }

  // Методы для отправки данных
  function sendData(data: any) {
    if (bridge) {
      bridge.notifyDataChange(data);
    }
  }

  function sendError(error: any) {
    if (bridge) {
      bridge.notifyError(error);
    }
  }

  function sendNavigation(path: string) {
    if (bridge) {
      bridge.notifyNavigation(path);
    }
  }

  function sendResize(dimensions: { width: number; height: number }) {
    if (bridge) {
      bridge.notifyResize(dimensions);
    }
  }

  // Система событий для подписки извне
  const eventListeners = new Map<string, Array<(data: any) => void>>();

  function on(event: string, callback: (data: any) => void) {
    if (!eventListeners.has(event)) {
      eventListeners.set(event, []);
    }
    const listeners = eventListeners.get(event);
    if (listeners) {
      listeners.push(callback);
    }
  }

  function off(event: string, callback: (data: any) => void) {
    const listeners = eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  function emit(event: string, data?: any) {
    const listeners = eventListeners.get(event);
    if (listeners) {
      listeners.forEach((callback) => callback(data));
    }
  }

  // Автоматическое отслеживание изменений размера
  function setupResizeObserver() {
    if (!isClient) {
      return () => {
        // Пустая функция для SSR
      };
    }

    if (typeof ResizeObserver !== 'undefined') {
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          sendResize({ width, height });
        }
      });

      resizeObserver.observe(document.body);

      return () => {
        resizeObserver.disconnect();
      };
    }
    // Возвращаем пустую функцию если ResizeObserver не поддерживается
    return () => {
      // Пустая функция очистки
    };
  }

  let cleanupResize: (() => void) | null = null;

  // Инициализация
  onMounted(() => {
    initBridge();

    if (isWidget.value) {
      cleanupResize = setupResizeObserver();
    }
  });

  // Очистка
  function cleanup() {
    if (cleanupResize) {
      cleanupResize();
      cleanupResize = null;
    }
    bridge = null;
    isReady.value = false;
    eventListeners.clear();
  }

  onUnmounted(() => {
    cleanup();
  });

  return {
    // Состояние
    isReady,
    isWidget,
    widgetData,
    config,

    // Методы
    sendData,
    sendError,
    sendNavigation,
    sendResize,

    // События
    on,
    off,
    emit,

    // Утилиты
    checkIfWidget,
    cleanup,
  };
}
