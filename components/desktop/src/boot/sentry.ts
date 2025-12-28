import { boot } from 'quasar/wrappers';
import { App } from 'vue';
import { Router } from 'vue-router';
import { env } from 'src/shared/config';

export default boot(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ({ app, router }: { app: App<Element>; router: Router }) => {
    if (process.env.CLIENT && (env.NODE_ENV as string) === 'production') {
      import('@openreplay/tracker')
        .then(({ tracker }) => {
          import('@openreplay/tracker-assist').then(
            ({ default: trackerAssist }) => {
              tracker.configure({
                projectKey: 'mgaCVSShnDNbPRFDZehd',
              });

              tracker.use(trackerAssist({}));

              // Start tracker
              import('src/entities/Session').then(({ useSessionStore }) => {
                const session = useSessionStore();
                if (session.username) {
                  tracker.setUserID(session.username);
                }
                tracker.start().catch(e => console.error('OpenReplay tracker start error:', e));
              });
            },
          );
        })
        .catch((e) => console.error('OpenReplay tracker configure error:', e));
    }
  },
);
