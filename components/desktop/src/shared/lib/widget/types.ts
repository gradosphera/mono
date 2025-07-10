import { ComputedRef, Ref } from 'vue';

// Базовые типы для widget системы
export interface IWidgetSDKConfig {
  baseUrl: string;
  page?: string;
  theme?: 'light' | 'dark';
  width?: string;
  height?: string;
  allowedOrigins?: string[];
}

export interface IWidgetSDKEventHandlers {
  onReady?: (data?: any) => void;
  onDataChange?: (data: any) => void;
  onError?: (error: any) => void;
  onNavigate?: (path: string) => void;
  onResize?: (dimensions: { width: number; height: number }) => void;
  onDestroy?: () => void;
}

export interface IWidgetEventData {
  type: string;
  payload?: any;
  timestamp: number;
  source?: string;
}

export interface IWidgetState {
  isWidget: boolean;
  isReady: boolean;
  parentOrigin: string;
  config: any;
}

export interface IWidgetComposable {
  isReady: Ref<boolean>;
  isWidget: Ref<boolean>;
  widgetData: Ref<any>;
  config: any;
  sendData: (data: any) => void;
  sendError: (error: any) => void;
  sendNavigation: (path: string) => void;
  sendResize: (dimensions: { width: number; height: number }) => void;
  on: (event: string, callback: (data: any) => void) => void;
  off: (event: string, callback: (data: any) => void) => void;
  emit: (event: string, data?: any) => void;
  checkIfWidget: () => boolean;
  cleanup: () => void;
}

export interface IWidgetRouterIntegration {
  navigateToRoute: (path: string) => void;
}

export interface IWidgetStateIntegration {
  watchStore: (store: any, key: string) => void;
  sendCurrentState: (data: any) => void;
}

export interface IWidgetRouteMeta {
  title?: string;
  hideHeader?: boolean;
  hideFooter?: boolean;
  disableNavigation?: boolean;
  theme?: 'light' | 'dark';
}

export interface IWidgetError {
  type: 'vue-error' | 'js-error' | 'unhandled-rejection' | 'widget-error';
  message: string;
  stack?: string;
  filename?: string;
  lineno?: number;
  colno?: number;
  info?: string;
  component?: string;
  timestamp: number;
}

export interface IWidgetEventStats {
  [eventType: string]: number;
}

export interface IWidgetEventHistory {
  events: IWidgetEventData[];
  lastEvent: IWidgetEventData | null;
  errorCount: number;
}

export interface IWidgetEventManager {
  initialize: () => void;
  destroy: () => void;
}

export interface IWidgetGlobalState {
  events: IWidgetEventData[];
  lastEvent: IWidgetEventData | null;
  errorCount: number;
  isListening: boolean;
}

export interface IWidgetDefaultConfig {
  enabled: boolean;
  allowedOrigins: string[];
  disableNavigation: boolean;
  hideHeader: boolean;
  hideFooter: boolean;
  theme?: 'light' | 'dark';
  locale?: string;
  maxWidth?: string;
  maxHeight?: string;
}

export interface IWidgetDimensions {
  width: number;
  height: number;
}

export interface IWidgetNavigationData {
  path: string;
  query?: Record<string, any>;
  params?: Record<string, any>;
}

export interface IWidgetReadyData {
  config: any;
  timestamp: number;
  data?: any;
}

export interface IWidgetConfigUpdate {
  theme?: 'light' | 'dark';
  hideHeader?: boolean;
  hideFooter?: boolean;
  disableNavigation?: boolean;
  allowedOrigins?: string[];
}

export interface IWidgetInitData {
  config?: IWidgetConfigUpdate;
  data?: any;
  origin?: string;
}

// Callback типы
export type WidgetEventCallback = (data: any) => void;
export type WidgetEventListener = (event: IWidgetEventData) => void;
export type WidgetMessageHandler = (message: any) => void;

// Типы для Vue App
export interface IWidgetVueApp {
  isWidget: ComputedRef<boolean>;
  isReady: ComputedRef<boolean>;
  config: ComputedRef<any>;
}

// Глобальные типы для приложения
export interface WidgetGlobalProperties {
  $widget: IWidgetVueApp;
}

// Типы для расширения Vue
export interface WidgetProvide {
  widget: IWidgetVueApp;
}
