import { boot } from 'quasar/wrappers';
import { createI18n } from 'vue-i18n';

import messages from 'src/i18n';

export type MessageLanguages = keyof typeof messages;
// Type-define 'en-US' as the master schema for the resource
export type MessageSchema = (typeof messages)['ru-RU'];

// See https://vue-i18n.intlify.dev/guide/advanced/typescript.html#global-resource-schema-type-definition
declare module 'vue-i18n' {
  // Схема сообщений из src/i18n; datetime/number — дефолты библиотеки (Intl*).
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- augmentation совпадает с MessageSchema
  export interface DefineLocaleMessage extends MessageSchema {}
}

export default boot(({ app }) => {
  const i18n = createI18n({
    locale: 'ru-RU',
    legacy: false,
    messages,
  });

  // Set i18n instance on app
  app.use(i18n);
});
