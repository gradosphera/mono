/**
 * Единые типы для переменных окружения
 * Этот файл является единственным источником истины для всех переменных окружения
 */

// Основной интерфейс переменных окружения для клиента
export interface EnvVars {
  NODE_ENV: string;
  BACKEND_URL: string;
  CHAIN_URL: string;
  CHAIN_ID: string;
  CURRENCY: string;
  COOP_SHORT_NAME: string;
  SITE_DESCRIPTION: string;
  SITE_IMAGE: string;
  STORAGE_URL: string;
  UPLOAD_URL: string;
  TIMEZONE: string;
  CLIENT?: boolean;
  SERVER?: boolean;
  VUE_ROUTER_MODE: string;
  VUE_ROUTER_BASE: string;
  NOVU_APP_ID: string;
  NOVU_BACKEND_URL: string;
  NOVU_SOCKET_URL: string;
  VAPID_PUBLIC_KEY: string;
}

// Расширяем интерфейс для сервера (добавляем дополнительные поля)
export interface ServerEnvVars extends EnvVars {
  CLIENT?: boolean;
  SERVER?: boolean;
}

// Типы для деклараций process.env (Node.js)
export interface ProcessEnvVars {
  SERVICE_WORKER_FILE?: string;
  PWA_FALLBACK_HTML?: string;
  NODE_ENV: string;
  BACKEND_URL: string;
  CHAIN_URL: string;
  CHAIN_ID: string;
  CURRENCY: string;
  COOP_SHORT_NAME: string;
  SITE_DESCRIPTION: string;
  SITE_IMAGE: string;
  STORAGE_URL: string;
  UPLOAD_URL: string;
  TIMEZONE?: string;
  VUE_ROUTER_MODE: string;
  VUE_ROUTER_BASE: string;
  NOVU_APP_ID: string;
  NOVU_BACKEND_URL: string;
  NOVU_SOCKET_URL: string;
  VAPID_PUBLIC_KEY: string;
}

// Расширяем глобальный Window для TypeScript
declare global {
  interface Window {
    __APP_CONFIG__?: EnvVars;
    __ENV__?: EnvVars;
  }
}
