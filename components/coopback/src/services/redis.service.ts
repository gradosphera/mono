import Redis from 'ioredis';

const redisPort = Number(process.env.REDIS_PORT) || 6379;
const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPassword = process.env.REDIS_PASSWORD;

export const redisSubscriber = new Redis({
  port: redisPort,
  host: redisHost,
  password: redisPassword,
});

export const redisPublisher = new Redis({
  port: redisPort,
  host: redisHost,
  password: redisPassword,
});
