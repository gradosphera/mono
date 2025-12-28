import { boot } from 'quasar/wrappers';
import * as Sentry from '@sentry/vue';
import { env } from 'src/shared/config';

export default boot(({ app, router }) => {
  // Инициализируем Sentry только если есть DSN
  if (!env.SENTRY_DSN) {
    console.warn('SENTRY_DSN не настроен, Sentry не инициализирован');
    return;
  } else console.log('SENTRY_DSN настроен, Sentry инициализирован');

  Sentry.init({
    app,
    dsn: env.SENTRY_DSN,
    integrations: [
      Sentry.browserTracingIntegration({ router }),
    ],
    tracesSampleRate: 0.01,
    environment: env.NODE_ENV || 'development',
  });
});
