import Redis from 'ioredis';
import config from '~/config/config';
import { WinstonLoggerService } from '~/modules/logger/logger-app.service';
import { Provider } from '@nestjs/common';

export const REDIS_PROVIDER = 'REDIS_CLIENT';

export const RedisProvider: Provider = {
  provide: REDIS_PROVIDER,
  useFactory: async (logger: WinstonLoggerService) => {
    const redisSubscriber = new Redis({
      port: config.redis.port,
      host: config.redis.host,
      password: config.redis.password,
    });

    const redisPublisher = new Redis({
      port: config.redis.port,
      host: config.redis.host,
      password: config.redis.password,
    });

    function logConnectionStatus(client: Redis, clientName: string) {
      client.on('ready', () => {
        logger.log(`${clientName} Redis client connected and ready`, 'RedisProvider');
      });
      client.on('close', () => {
        logger.log(`${clientName} Redis client connection closed`, 'RedisProvider');
      });
      client.on('reconnecting', () => {
        logger.warn(`${clientName} Redis client reconnecting...`, 'RedisProvider');
      });
      client.on('end', () => {
        logger.log(`${clientName} Redis client connection ended`, 'RedisProvider');
      });
      client.on('error', (error) => {
        logger.error(`${clientName} Redis client error: ${error.message}`, 'RedisProvider');
      });
    }

    logConnectionStatus(redisSubscriber, 'Subscriber');
    logConnectionStatus(redisPublisher, 'Publisher');

    // await Promise.all([
    //   redisSubscriber.connect().catch((error) => logger.error(`Subscriber connect error: ${error.message}`)),
    //   redisPublisher.connect().catch((error) => logger.error(`Publisher connect error: ${error.message}`)),
    // ]);

    return {
      subscriber: redisSubscriber,
      publisher: redisPublisher,
    };
  },
  inject: [WinstonLoggerService], // Инжектируем логгер
};
