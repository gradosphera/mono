// Простые экспорты для widget системы
export { PostMessageBridge } from './postmessage-bridge';
export { WidgetMode, useWidgetMode, widgetModeInstance } from './widget-mode';
export { useWidgetBridge } from './use-widget-bridge';
export {
  useWidgetEvents,
  WidgetEventManager,
  widgetEventManager,
} from './widget-events';

// Типы
export * from './types';

// Конфигурация
export {
  DEFAULT_WIDGET_CONFIG,
  WIDGET_MESSAGE_TYPES,
  isOriginAllowed,
  createWidgetMessage,
  isValidWidgetMessage,
} from 'src/shared/config/widget';

export type {
  IWidgetConfig,
  IWidgetMessage,
  IWidgetAPI,
  WidgetMessageType,
} from 'src/shared/config/widget';

export type { WidgetEventData, WidgetEventHandlers } from './widget-events';

// Константы
export const WIDGET_CONSTANTS = {
  URL_PARAMS: {
    WIDGET_MODE: 'widget',
    WIDGET_CONFIG: 'widget_config',
    WIDGET_ORIGIN: 'widget_origin',
    WIDGET_PAGE: 'widget_page',
  },
} as const;
