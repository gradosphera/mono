import morgan from 'morgan';
import config from './config';
import logger from './logger';

// Переопределяем токен message для поддержки GraphQL ошибок
morgan.token('message', (req, res) => {
  // Сначала проверяем res.locals.errorMessage (установленное нашими фильтрами)
  if (res.locals.errorMessage) {
    return res.locals.errorMessage;
  }

  // Для GraphQL запросов пытаемся извлечь ошибки из тела ответа
  if (req.path === '/v1/graphql' && res.locals.graphQLErrors) {
    const errors = res.locals.graphQLErrors;
    if (Array.isArray(errors) && errors.length > 0) {
      return errors[0].message || 'GraphQL Error';
    }
  }

  return '';
});

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
