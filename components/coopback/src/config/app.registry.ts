// config/app-registry.config.ts

import * as glob from 'glob';
import * as path from 'path';

export const AppRegistry: Record<string, any> = {};

// Автоматически ищем и подключаем все приложения из `apps`
const appFiles = glob.sync(path.join(__dirname, '../apps/**/*.plugin.{ts,js}'));

appFiles.forEach((file) => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const app = require(file);
  const appName = path.basename(path.dirname(file)); // Имя приложения по названию папки
  AppRegistry[appName] = app;
});
