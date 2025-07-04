// Типы для переменных окружения
export interface EnvVars {
  NODE_ENV?: string;
  BACKEND_URL?: string;
  CHAIN_URL?: string;
  CHAIN_ID?: string;
  CURRENCY?: string;
  COOP_SHORT_NAME?: string;
  SITE_DESCRIPTION?: string;
  SITE_IMAGE?: string;
  STORAGE_URL?: string;
  UPLOAD_URL?: string;
  TIMEZONE?: string;
  CLIENT?: boolean;
  SERVER?: boolean;
  VUE_ROUTER_MODE?: string;
  VUE_ROUTER_BASE?: string;
  NOVU_APP_ID?: string;
  NOVU_BACKEND_URL?: string;
  NOVU_SOCKET_URL?: string;
  [key: string]: string | boolean | undefined;
}

// Расширяем глобальный Window чтобы TypeScript понимал window.__ENV__
declare global {
  interface Window {
    __ENV__?: EnvVars;
  }
}

/**
 * Определение переменных окружения для разных сред
 * - На сервере (SSR): берем напрямую из process.env
 * - На клиенте (SSR): используем window.__ENV__, инжектированные с сервера
 * - В SPA режиме: переменные заменяются при сборке
 */
function getEnv(): EnvVars {
  // SSR сервер или SPA сборка

  if (typeof process !== 'undefined' && process.env) {
    // Для SSR сервера - берем реальные переменные
    // Для SPA - эти значения заменятся при сборке
    return {
      NODE_ENV: process.env.NODE_ENV,
      BACKEND_URL: process.env.BACKEND_URL,
      CHAIN_URL: process.env.CHAIN_URL,
      CHAIN_ID: process.env.CHAIN_ID,
      CURRENCY: process.env.CURRENCY,
      COOP_SHORT_NAME: process.env.COOP_SHORT_NAME,
      SITE_DESCRIPTION: process.env.SITE_DESCRIPTION,
      SITE_IMAGE: process.env.SITE_IMAGE,
      STORAGE_URL: process.env.STORAGE_URL,
      UPLOAD_URL: process.env.UPLOAD_URL,
      TIMEZONE: process.env.TIMEZONE || 'Europe/Moscow',
      CLIENT: process.env.CLIENT as unknown as boolean,
      SERVER: process.env.SERVER as unknown as boolean,
      VUE_ROUTER_MODE: process.env.VUE_ROUTER_MODE,
      VUE_ROUTER_BASE: process.env.VUE_ROUTER_BASE,
      NOVU_APP_ID: process.env.NOVU_APP_ID,
      NOVU_BACKEND_URL: process.env.NOVU_BACKEND_URL,
      NOVU_SOCKET_URL: process.env.NOVU_SOCKET_URL,
    };
  }

  // SSR клиент - берем из window.__ENV__
  if (typeof window !== 'undefined' && window.__ENV__) {
    return window.__ENV__;
  }

  // Запасной вариант, если ничего не сработало
  console.warn('Не удалось получить переменные окружения!');
  return {} as EnvVars;
}

// Экспортируем переменные окружения
export const env: EnvVars = getEnv();
