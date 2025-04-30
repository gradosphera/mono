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
  CLIENT?: boolean;
  SERVER?: boolean;
  VUE_ROUTER_MODE?: string;
  VUE_ROUTER_BASE?: string;
}

// Для SPA и клиента SSR — явные обращения (Quasar заменит их при сборке)
function getStaticEnv(): EnvVars {
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
    CLIENT: process.env.CLIENT as unknown as boolean,
    SERVER: process.env.SERVER as unknown as boolean,
    VUE_ROUTER_MODE: process.env.VUE_ROUTER_MODE,
    VUE_ROUTER_BASE: process.env.VUE_ROUTER_BASE
  };
}

// Для сервера SSR — читает Docker-переменные в рантайме
function getRuntimeEnv(): EnvVars {
  // Используем тот же объект, что и для статичных значений,
  // но читаем из реального process.env в рантайме
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
    CLIENT: process.env.CLIENT as unknown as boolean,
    SERVER: process.env.SERVER as unknown as boolean,
    VUE_ROUTER_MODE: process.env.VUE_ROUTER_MODE,
    VUE_ROUTER_BASE: process.env.VUE_ROUTER_BASE
  };
}

// Выбираем стратегию в зависимости от режима
export const env: EnvVars = process.env.SERVER ? getRuntimeEnv() : getStaticEnv();
