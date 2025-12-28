import { ssrMiddleware } from 'quasar/wrappers';
import { getEnvVarsForClient, createEnvInjectionScript, createConfigJsScript } from '../../src/shared/config/env.utils';

/**
 * SSR middleware для инъекции переменных окружения
 * Работает двумя способами:
 * 1. Инъекция в HTML (для SSR) - как раньше
 * 2. Отдельный маршрут /config.js (для PWA fallback)
 */
export default ssrMiddleware(({ app }) => {

  // 1. Middleware для инъекции в HTML (основной способ)
  app.use((req, res, next) => {
    const envForClient = getEnvVarsForClient();
    const script = createEnvInjectionScript(envForClient);

    // Оригинальный метод отправки HTML
    const originalSend = res.send;

    // Переопределяем метод, чтобы вставить наш скрипт перед закрывающим тегом </head>
    res.send = function (html) {
      if (typeof html === 'string') {
        html = html.replace('</head>', `${script}</head>`);
      }
      return originalSend.call(this, html);
    };

    // Продолжаем обработку запроса
    next();
  });

  // 2. Отдельный маршрут для PWA fallback
  app.get('/config.js', (req, res) => {
    const envForClient = getEnvVarsForClient();
    const configScript = createConfigJsScript(envForClient);

    // Устанавливаем заголовки для предотвращения кэширования
    res.set({
      'Content-Type': 'application/javascript',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
    });

    // Отправляем JavaScript файл
    res.send(configScript);
  });
});
