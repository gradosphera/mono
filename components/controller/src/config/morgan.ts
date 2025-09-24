import morgan from 'morgan';
import config from './config';
import logger from './logger';

morgan.token('message', (req, res) => res.locals.errorMessage || '');

// Новый токен для определения IP с проверкой нескольких заголовков
morgan.token('client-ip', (req) => {
  return req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
});

// Форматы с использованием нового токена 'client-ip'
const getIpFormat = () => (config.env === 'production' ? ':client-ip - ' : ':remote-addr - ');
const successResponseFormat = `${getIpFormat()}:method :url :status - :response-time ms`;
const errorResponseFormat = `${getIpFormat()}:method :url :status - :response-time ms - message: :message`;

const successHandler = morgan(successResponseFormat, {
  skip: (req, res) => res.statusCode >= 400,
  stream: { write: (message) => logger.debug(message.trim()) },
});

const errorHandler = morgan(errorResponseFormat, {
  skip: (req, res) => res.statusCode < 400,
  stream: { write: (message) => logger.error(message.trim()) },
});

export default {
  successHandler,
  errorHandler,
};
