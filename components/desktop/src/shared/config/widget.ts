// Конфигурация для iframe виджета
export interface IWidgetConfig {
  enabled: boolean;
  allowedOrigins: string[];
  disableNavigation: boolean;
  hideHeader: boolean;
  hideFooter: boolean;
  maxWidth?: string;
  maxHeight?: string;
  theme?: 'light' | 'dark';
  locale?: string;
}

export interface IWidgetMessage {
  type: string;
  data?: any;
  timestamp: number;
  id?: string;
}

export interface IWidgetAPI {
  // Методы для отправки данных в виджет
  navigate: (path: string) => void;
  setData: (data: any) => void;
  updateConfig: (config: Partial<IWidgetConfig>) => void;

  // Методы для получения данных из виджета
  getData: () => Promise<any>;
  getStatus: () => Promise<any>;

  // События
  onReady: (callback: () => void) => void;
  onDataChange: (callback: (data: any) => void) => void;
  onError: (callback: (error: any) => void) => void;
  onNavigate: (callback: (path: string) => void) => void;
}

export const DEFAULT_WIDGET_CONFIG: IWidgetConfig = {
  enabled: false,
  allowedOrigins: [],
  disableNavigation: false,
  hideHeader: true,
  hideFooter: true,
  theme: 'light',
  locale: 'ru',
};

export const WIDGET_MESSAGE_TYPES = {
  // Исходящие сообщения (из виджета)
  WIDGET_READY: 'widget:ready',
  WIDGET_DATA_CHANGE: 'widget:data-change',
  WIDGET_ERROR: 'widget:error',
  WIDGET_NAVIGATE: 'widget:navigate',
  WIDGET_RESIZE: 'widget:resize',

  // Входящие сообщения (в виджет)
  WIDGET_INIT: 'widget:init',
  WIDGET_SET_DATA: 'widget:set-data',
  WIDGET_GET_DATA: 'widget:get-data',
  WIDGET_NAVIGATE_TO: 'widget:navigate-to',
  WIDGET_UPDATE_CONFIG: 'widget:update-config',
  WIDGET_DESTROY: 'widget:destroy',
} as const;

export type WidgetMessageType =
  (typeof WIDGET_MESSAGE_TYPES)[keyof typeof WIDGET_MESSAGE_TYPES];

// Проверка разрешенных origin
export function isOriginAllowed(
  origin: string,
  allowedOrigins: string[],
): boolean {
  if (allowedOrigins.includes('*')) return true;
  return allowedOrigins.some((allowed) => {
    if (allowed.startsWith('*.')) {
      const domain = allowed.substring(2);
      return origin.endsWith(domain);
    }
    return origin === allowed;
  });
}

// Создание безопасного сообщения
export function createWidgetMessage(
  type: WidgetMessageType,
  data?: any,
  id?: string,
): IWidgetMessage {
  return {
    type,
    data,
    timestamp: Date.now(),
    id: id || generateMessageId(),
  };
}

// Генерация ID сообщения
function generateMessageId(): string {
  return Math.random().toString(36).substring(2, 15);
}

// Проверка валидности сообщения
export function isValidWidgetMessage(message: any): message is IWidgetMessage {
  return (
    typeof message === 'object' &&
    message !== null &&
    typeof message.type === 'string' &&
    typeof message.timestamp === 'number' &&
    Object.values(WIDGET_MESSAGE_TYPES).includes(message.type)
  );
}
