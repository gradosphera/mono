import { EnvVars, ServerEnvVars } from './env.types';

/**
 * Единая утилита для работы с переменными окружения
 */

/**
 * Получает переменные окружения для клиента из process.env
 * Используется на сервере для SSR и в dev режиме
 */
export function getEnvVarsForClient(): EnvVars {
  return {
    NODE_ENV: process.env.NODE_ENV as string,
    BACKEND_URL: process.env.BACKEND_URL as string,
    CHAIN_URL: process.env.CHAIN_URL as string,
    CHAIN_ID: process.env.CHAIN_ID as string,
    CURRENCY: process.env.CURRENCY as string,
    COOP_SHORT_NAME: process.env.COOP_SHORT_NAME as string,
    SITE_DESCRIPTION: process.env.SITE_DESCRIPTION as string,
    SITE_IMAGE: process.env.SITE_IMAGE as string,
    STORAGE_URL: process.env.STORAGE_URL as string,
    UPLOAD_URL: process.env.UPLOAD_URL as string,
    TIMEZONE: process.env.TIMEZONE || 'Europe/Moscow',
    CLIENT: process.env.CLIENT as unknown as boolean | undefined,
    SERVER: process.env.SERVER as unknown as boolean | undefined,
    VUE_ROUTER_MODE: process.env.VUE_ROUTER_MODE as string,
    VUE_ROUTER_BASE: process.env.VUE_ROUTER_BASE as string,
    NOVU_APP_ID: process.env.NOVU_APP_ID as string,
    NOVU_BACKEND_URL: process.env.NOVU_BACKEND_URL as string,
    NOVU_SOCKET_URL: process.env.NOVU_SOCKET_URL as string,
    VAPID_PUBLIC_KEY: process.env.VAPID_PUBLIC_KEY as string,
  };
}

/**
 * Получает переменные окружения для сервера (включая дополнительные поля)
 */
export function getEnvVarsForServer(): ServerEnvVars {
  return {
    ...getEnvVarsForClient(),
    CLIENT: process.env.CLIENT as unknown as boolean,
    SERVER: process.env.SERVER as unknown as boolean,
  };
}

/**
 * Синхронная загрузка config.js через XMLHttpRequest
 * Используется как fallback когда переменные не инжектированы в HTML
 */
export function loadConfigSync(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    console.log('DEBUG: Синхронная загрузка config.js');

    const xhr = new XMLHttpRequest();
    xhr.open('GET', `/config.js?t=${Date.now()}`, false); // false = синхронный запрос
    xhr.send();

    if (xhr.status === 200) {
      // Выполняем JavaScript код из ответа
      eval(xhr.responseText);

      if (window.__APP_CONFIG__) {
        console.log('DEBUG: config.js загружен синхронно');
        return true;
      }
    }
  } catch (error) {
    console.warn('DEBUG: Ошибка синхронной загрузки config.js:', error);
  }

  return false;
}

/**
 * Создает JavaScript код для инъекции переменных в HTML
 */
export function createEnvInjectionScript(envVars: EnvVars, globalVarName: '__APP_CONFIG__' | '__ENV__' = '__APP_CONFIG__'): string {
  return `
  <script>
    window.${globalVarName} = ${JSON.stringify(envVars)};
    console.log('SSR: Переменные окружения загружены в ${globalVarName}');
  </script>
  `;
}

/**
 * Создает JavaScript файл с конфигурацией для PWA fallback
 */
export function createConfigJsScript(envVars: EnvVars): string {
  return `
// Конфигурация переменных окружения для клиента (PWA fallback)
// Автоматически сгенерировано SSR middleware
window.__APP_CONFIG__ = ${JSON.stringify(envVars, null, 2)};
console.log('Config.js: Переменные окружения загружены через отдельный маршрут');
`;
}
