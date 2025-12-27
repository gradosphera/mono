// index.ts
import mongoose from 'mongoose';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import config from './config/config';
import logger from './config/logger';
import { ExpressAdapter } from '@nestjs/platform-express';
import expressApp from './app';
import { WinstonLoggerService } from './application/logger/logger-app.service';
import { GraphQLExceptionFilter } from './infrastructure/graphql/filters/graphql-exceptions.filter';
import { migrateData } from './migrator/migrate';
import { ValidationPipe } from '@nestjs/common';

export let nestApp;

/**
 * Получить экземпляр TokenApplicationService из NestJS контейнера
 * Используется для доступа к сервисам токенов из не-NestJS контекстов
 */
export function getTokenApplicationService() {
  if (!nestApp) {
    throw new Error('NestJS application not initialized');
  }
  return nestApp.get('TokenApplicationService');
}

async function bootstrap() {
  // Проверяем, был ли запущен режим миграций
  const args = process.argv.slice(2);
  if (args.includes('--migrate')) {
    await migrateData();
    process.exit(0);
  }

  // Проверяем, был ли запущен режим только миграций (для обратной совместимости)
  if (args.includes('--migrations-only')) {
    await migrateData();
    logger.info('Режим только миграций - миграции выполнены, сервер не будет запущен');
    process.exit(0);
  }

  // Подключение к MongoDB
  await mongoose.connect(config.mongoose.url);
  logger.info('Connected to MongoDB');

  // Добавьте миддлвар для отключения CSP в локальной разработке
  expressApp.use((req, res, next) => {
    if (config.env !== 'production') {
      res.removeHeader('Content-Security-Policy'); // Отключить CSP для локальной разработки
    }
    next();
  });

  // Создаем приложение NestJS и подключаем Express-приложение как middleware
  nestApp = await NestFactory.create(AppModule, new ExpressAdapter(expressApp), {
    logger: new WinstonLoggerService(),
  });

  // Глобальный фильтр для перехвата всех исключений внутри NestJS
  nestApp.useGlobalFilters(new GraphQLExceptionFilter());
  nestApp.useGlobalPipes(
    new ValidationPipe({
      errorHttpStatusCode: 422,
      // whitelist: true, // Удаляет неописанные поля
      // forbidNonWhitelisted: true, // Вызывает ошибку, если переданы лишние поля
      // forbidUnknownValues: true, // Ошибка, если объект отсутствует
    })
  );

  // Запуск сервера
  await nestApp.listen(config.port, () => {
    logger.info(`NestJS app with Express routes running on port ${config.port}`);
  });

  // Завершение работы приложения при неожиданных ошибках
  const exitHandler = async () => {
    await mongoose.disconnect();
    logger.info('Server closed');
    process.exit(1);
  };

  const unexpectedErrorHandler = async (error: any) => {
    console.error(error);
    await mongoose.disconnect();
    logger.error(error, { source: 'unexpectedErrorHandler' });
    await exitHandler();
  };

  process.on('uncaughtException', unexpectedErrorHandler);
  process.on('unhandledRejection', unexpectedErrorHandler);

  process.on('SIGTERM', async () => {
    logger.info('SIGTERM received');
    await mongoose.disconnect();
    await nestApp.close();
  });
}

bootstrap();
