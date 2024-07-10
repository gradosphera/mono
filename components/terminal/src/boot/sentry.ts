import { boot } from 'quasar/wrappers';
import * as Sentry from '@sentry/vue';
import { App } from 'vue';
import { Router } from 'vue-router';
import { BASE_URL, NODE_ENV, SENTRY_DSN } from 'src/shared/config';

export default boot(
  ({ app, router }: { app: App<Element>; router: Router }) => {
    if ((NODE_ENV as string) === 'production') {
      Sentry.init({
        app,
        dsn: SENTRY_DSN, // Замените на ваш DSN из Sentry

        integrations: [
          Sentry.browserTracingIntegration({ router }),
          Sentry.replayIntegration(),
        ],

        tracePropagationTargets: [BASE_URL, /^\/api/],

        // Установите tracesSampleRate на значение между 0 и 1, чтобы собирать данные о производительности
        tracesSampleRate: 1.0,
        // Capture Replay for 10% of all sessions,
        // plus for 100% of sessions with an error
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1.0,
      });

      app.config.errorHandler = (err, vm, info) => {
        Sentry.captureException(err);
        console.error(err, info);
      };
    }
  }
);
