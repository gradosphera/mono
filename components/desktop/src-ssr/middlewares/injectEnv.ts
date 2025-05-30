import { ssrMiddleware } from 'quasar/wrappers';
import { EnvVars } from '../../src/shared/config/Environment';

/**
 * SSR middleware для инъекции переменных окружения в браузер
 * Создает window.__ENV__ со всеми переменными, которые должны быть доступны на клиенте
 */
export default ssrMiddleware(({ app }) => {
  // Регистрируем middleware для всех запросов
  app.use((req, res, next) => {
    // Получаем переменные из process.env, которые нужны клиенту
    const envForClient: EnvVars = {
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
      TIMEZONE: process.env.TIMEZONE,
      VUE_ROUTER_MODE: process.env.VUE_ROUTER_MODE,
      VUE_ROUTER_BASE: process.env.VUE_ROUTER_BASE
    };

    // Создаем скрипт, который добавит переменные в window.__ENV__
    const script = `
    <script>
      window.__ENV__ = ${JSON.stringify(envForClient)};
      console.log('SSR: Переменные окружения загружены');
    </script>
    `;

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
});
