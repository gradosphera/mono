export * from './types';

import mongoose from 'mongoose';
import app from './app';
import config from './config/config';
import logger from './config/logger';
import { connectGenerator } from './services/document.service';
import { initPolling } from './services/polling.service';
import { redisSubscriber } from './services/redis.service';

let server: any;

mongoose.connect(config.mongoose.url).then(async () => {
  logger.info('Connected to MongoDB with payment processor');

  // подключаемся к хранилищу приватных данных
  await connectGenerator();

  redisSubscriber.subscribe(`${config.coopname}:orderStatusUpdate`, (err, count) => {
    if (err) {
      logger.error('Failed to subscribe: ', err);
    } else {
      logger.info(`Subscribed successfully! This client is currently subscribed to ${count} channels.`);
    }
  });

  redisSubscriber.on('message', (channel, message) => {
    if (channel === `${config.coopname}:orderStatusUpdate` && message) {
      const { orderId, status } = JSON.parse(message);
      // Дальнейшая обработка
    }
  });

  initPolling();
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
  logger.error(error);
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
