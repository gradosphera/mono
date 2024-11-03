// index.ts
import mongoose from 'mongoose';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import config from './config/config';
import logger from './config/logger';
import { connectGenerator, diconnectGenerator } from './services/document.service';
import { initSocketConnection } from './controllers/ws.controller';
import { pluginFactory } from './plugins/pluginFactory';
import { paymentService } from './services';
import { initializeDefaultPlugins } from './services/plugin.service';

const SERVER_URL: string = process.env.SOCKET_SERVER || 'http://localhost:2222';

async function bootstrap() {
  // Подключение к MongoDB
  await mongoose.connect(config.mongoose.url);
  logger.info('Connected to MongoDB');

  // Запуск дополнительных сервисов
  await connectGenerator();
  await initSocketConnection(SERVER_URL);
  await paymentService.init();
  await initializeDefaultPlugins();
  await pluginFactory();

  // Создаем приложение NestJS и подключаем Express-приложение как middleware
  const app = await NestFactory.create(AppModule);

  // Запуск сервера
  await app.listen(config.port, () => {
    logger.info(`NestJS app with Express routes running on port ${config.port}`);
  });

  // Завершение работы приложения при неожиданных ошибках
  const exitHandler = async () => {
    await diconnectGenerator();
    await mongoose.disconnect();
    logger.info('Server closed');
    process.exit(1);
  };

  const unexpectedErrorHandler = async (error: any) => {
    console.error(error);
    await diconnectGenerator();
    await mongoose.disconnect();
    logger.error(error, { source: 'unexpectedErrorHandler' });
    await exitHandler();
  };

  process.on('uncaughtException', unexpectedErrorHandler);
  process.on('unhandledRejection', unexpectedErrorHandler);

  process.on('SIGTERM', async () => {
    logger.info('SIGTERM received');
    await mongoose.disconnect();
    await app.close();
  });
}

bootstrap();
