import {
  IWidgetMessage,
  IWidgetConfig,
  WidgetMessageType,
  WIDGET_MESSAGE_TYPES,
  isOriginAllowed,
  createWidgetMessage,
  isValidWidgetMessage,
} from 'src/shared/config/widget';

// Проверка на существование window (для SSR)
const isClient = typeof window !== 'undefined';

export class PostMessageBridge {
  private config: IWidgetConfig;
  private parentWindow: Window | null = null;
  private eventListeners: Map<string, Array<(data: any) => void>> = new Map();
  private messageQueue: IWidgetMessage[] = [];
  private isReady = false;
  private pendingResponses: Map<string, (data: any) => void> = new Map();

  constructor(config: IWidgetConfig) {
    this.config = config;
    this.init();
  }

  private init() {
    // Инициализация только на клиенте
    if (!isClient) return;

    // Проверяем, работаем ли мы внутри iframe
    if (window.parent !== window) {
      this.parentWindow = window.parent;
      this.setupMessageListener();
    }
  }

  private setupMessageListener() {
    if (!isClient) return;

    window.addEventListener('message', (event) => {
      this.handleMessage(event);
    });
  }

  private handleMessage(event: MessageEvent) {
    // Проверяем origin
    if (!isOriginAllowed(event.origin, this.config.allowedOrigins)) {
      console.warn(
        `[Widget] Blocked message from unauthorized origin: ${event.origin}`,
      );
      return;
    }

    // Проверяем структуру сообщения
    if (!isValidWidgetMessage(event.data)) {
      console.warn('[Widget] Invalid message format:', event.data);
      return;
    }

    const message = event.data as IWidgetMessage;

    // Обрабатываем сообщение
    this.processMessage(message);
  }

  private processMessage(message: IWidgetMessage) {
    switch (message.type) {
      case WIDGET_MESSAGE_TYPES.WIDGET_INIT:
        this.handleInit(message.data);
        break;

      case WIDGET_MESSAGE_TYPES.WIDGET_SET_DATA:
        this.handleSetData(message.data);
        break;

      case WIDGET_MESSAGE_TYPES.WIDGET_GET_DATA:
        this.handleGetData(message.id);
        break;

      case WIDGET_MESSAGE_TYPES.WIDGET_NAVIGATE_TO:
        this.handleNavigateTo(message.data);
        break;

      case WIDGET_MESSAGE_TYPES.WIDGET_UPDATE_CONFIG:
        this.handleUpdateConfig(message.data);
        break;

      case WIDGET_MESSAGE_TYPES.WIDGET_DESTROY:
        this.handleDestroy();
        break;

      default:
        console.warn('[Widget] Unknown message type:', message.type);
    }
  }

  private handleInit(data: any) {
    console.log('[Widget] Initializing with data:', data);

    // Обновляем конфигурацию если передана
    if (data?.config) {
      this.config = { ...this.config, ...data.config };
    }

    // Устанавливаем готовность
    this.isReady = true;

    // Отправляем сообщение о готовности
    this.sendMessage(WIDGET_MESSAGE_TYPES.WIDGET_READY, {
      config: this.config,
      timestamp: Date.now(),
    });

    // Обрабатываем очередь сообщений
    this.processMessageQueue();

    // Вызываем обработчики
    this.emit('ready', data);
  }

  private handleSetData(data: any) {
    console.log('[Widget] Setting data:', data);
    this.emit('data-change', data);
  }

  private handleGetData(messageId?: string) {
    const responseData = this.emit('get-data');

    if (messageId) {
      this.sendMessage(
        WIDGET_MESSAGE_TYPES.WIDGET_DATA_CHANGE,
        responseData,
        messageId,
      );
    }
  }

  private handleNavigateTo(path: string) {
    console.log('[Widget] Navigate to:', path);
    this.emit('navigate', path);
  }

  private handleUpdateConfig(config: Partial<IWidgetConfig>) {
    console.log('[Widget] Updating config:', config);
    this.config = { ...this.config, ...config };
    this.emit('config-change', this.config);
  }

  private handleDestroy() {
    console.log('[Widget] Destroying widget');
    this.cleanup();
    this.emit('destroy');
  }

  private processMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) {
        this.sendMessageToParent(message);
      }
    }
  }

  // Публичные методы для отправки сообщений
  public sendMessage(type: WidgetMessageType, data?: any, id?: string) {
    if (!isClient) return;

    const message = createWidgetMessage(type, data, id);

    if (this.isReady) {
      this.sendMessageToParent(message);
    } else {
      this.messageQueue.push(message);
    }
  }

  private sendMessageToParent(message: IWidgetMessage) {
    if (!isClient || !this.parentWindow) return;

    // Отправляем сообщение всем разрешенным origins
    this.config.allowedOrigins.forEach((origin) => {
      if (origin !== '*' && this.parentWindow) {
        this.parentWindow.postMessage(message, origin);
      }
    });

    // Если разрешены все origins
    if (this.config.allowedOrigins.includes('*') && this.parentWindow) {
      this.parentWindow.postMessage(message, '*');
    }
  }

  // Система событий
  public on(event: string, callback: (data: any) => void) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.push(callback);
    }
  }

  public off(event: string, callback: (data: any) => void) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: any): any {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      let result;
      listeners.forEach((callback) => {
        result = callback(data);
      });
      return result;
    }
  }

  // Методы для отправки специфичных сообщений
  public notifyDataChange(data: any) {
    this.sendMessage(WIDGET_MESSAGE_TYPES.WIDGET_DATA_CHANGE, data);
  }

  public notifyError(error: any) {
    this.sendMessage(WIDGET_MESSAGE_TYPES.WIDGET_ERROR, {
      message: error.message || 'Unknown error',
      stack: error.stack,
      timestamp: Date.now(),
    });
  }

  public notifyNavigation(path: string) {
    this.sendMessage(WIDGET_MESSAGE_TYPES.WIDGET_NAVIGATE, { path });
  }

  public notifyResize(dimensions: { width: number; height: number }) {
    this.sendMessage(WIDGET_MESSAGE_TYPES.WIDGET_RESIZE, dimensions);
  }

  // Очистка ресурсов
  private cleanup() {
    this.eventListeners.clear();
    this.messageQueue.length = 0;
    this.pendingResponses.clear();
    this.isReady = false;
  }

  // Геттеры
  public get isWidgetReady(): boolean {
    return this.isReady;
  }

  public get widgetConfig(): IWidgetConfig {
    return { ...this.config };
  }
}
