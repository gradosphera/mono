// Импортируем типы и утилиты из централизованного места
export type { EnvVars } from './env.types';
import { EnvVars } from './env.types';
import { loadConfigSync, getEnvVarsForServer } from './env.utils';

// Кэш для переменных окружения
let envCache: EnvVars | null = null;
let isLoading = false;


/**
 * Определение переменных окружения для разных сред
 * Автоматически загружает config.js если переменные недоступны
 */
function getEnv(): EnvVars {
  // Если уже есть кэш, возвращаем его
  if (envCache) {
    return envCache;
  }

  // Предотвращаем множественные загрузки
  if (isLoading) {
    console.log('DEBUG: Загрузка уже в процессе, ждем...');
    // В синхронном режиме просто возвращаем пустой объект
    return {} as EnvVars;
  }

  isLoading = true;
  console.log('DEBUG: getEnv() called');

  // Пробуем получить window.__APP_CONFIG__ (инжектированные в HTML)
  try {
    if (typeof window !== 'undefined' && window.__APP_CONFIG__) {
      console.log('DEBUG: Используем window.__APP_CONFIG__ из HTML');
      envCache = window.__APP_CONFIG__;
      isLoading = false;
      return envCache;
    } else if (typeof window !== 'undefined') {
      console.log(
        'DEBUG: window.__APP_CONFIG__ не найден, загружаем config.js',
      );

      // Пытаемся загрузить конфигурацию синхронно
      if (loadConfigSync() && window.__APP_CONFIG__) {
        envCache = window.__APP_CONFIG__;
        isLoading = false;
        return envCache;
      }
    } else {
      console.log('DEBUG: window недоступен (сервер)');
    }
  } catch (e) {
    console.error('DEBUG: Ошибка при работе с window:', e);
  }

  // Fallback к process.env (для сервера или dev режима)
  console.log('DEBUG: Используем process.env как fallback');
  envCache = getEnvVarsForServer();

  isLoading = false;
  return envCache;
}

/**
 * Очищает кэш переменных окружения
 * Используется когда нужно перезагрузить конфигурацию
 */
export function clearEnvCache(): void {
  envCache = null;
  isLoading = false;
}

/**
 * Ленивый геттер для переменных окружения
 * Автоматически загружает конфигурацию при первом обращении
 */
export const env = new Proxy({} as EnvVars, {
  get(target, prop) {
    const envVars = getEnv();
    return envVars[prop as keyof EnvVars];
  },
});
