export * from './types';

import mongoose from 'mongoose';
import app from './app';
import config from './config/config';
import logger from './config/logger';
import { connectGenerator } from './services/document.service';
import { initSocketConnection } from './controllers/ws.controller';
import { initializeDefaultPlugins, pluginFactory } from './factories/pluginFactory';

const SERVER_URL: string = process.env.SOCKET_SERVER || 'http://localhost:2222';

let server: any;

mongoose.connect(config.mongoose.url).then(async () => {
  logger.info('Connected to MongoDB');

  // подключаемся к хранилищу приватных данных
  await connectGenerator();

  // подключаемся к ws-серверу
  await initSocketConnection(SERVER_URL);

  // Инициализация дефолтных плагинов
  await initializeDefaultPlugins();

  // // Запуск плагинов
  await pluginFactory();

  server = app.listen(config.port, () => {
    logger.info(`Listening to port ${config.port}`);
  });
});

const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error: any) => {
  logger.error(error, { source: 'unexpectedErrorHandler' });
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  if (server) {
    server.close();
  }
});
