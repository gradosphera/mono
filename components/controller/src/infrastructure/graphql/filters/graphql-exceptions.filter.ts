import { Catch, HttpException, HttpStatus, ExecutionContext } from '@nestjs/common';
import { GqlExceptionFilter, GqlExecutionContext } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';
import mongoose from 'mongoose';
import { RpcError } from 'eosjs';
import logger from '../../../config/logger';
import { HttpApiError } from '../../../utils/httpApiError';

@Catch()
export class GraphQLExceptionFilter implements GqlExceptionFilter {
  catch(exception: any, host: ExecutionContext) {
    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal Server Error';

    // Получаем контекст GraphQL для извлечения информации о пользователе и GraphQL запросе
    const gqlContext = GqlExecutionContext.create(host);
    const context = gqlContext.getContext();
    const user = context?.req?.user;

    // Получаем информацию о GraphQL запросе
    const info = gqlContext.getInfo();
    const operationName = info?.operation?.name?.value;
    const fieldName = info?.fieldName;
    const path = info?.path?.typename ? `${info.path.typename}.${fieldName}` : fieldName;

    // Получаем locations из AST
    const locations = info?.operation?.loc?.startToken
      ? [
          {
            line: info.operation.loc.startToken.line,
            column: info.operation.loc.startToken.column,
          },
        ]
      : [];

    // Обработка ValidationPipe ошибок
    let originalMessage = message; // Сохраняем оригинальное сообщение для логов
    if (exception instanceof HttpException) {
      const response = exception.getResponse();

      if (typeof response === 'object' && response['message']) {
        message = Array.isArray(response['message']) ? response['message'].join(', ') : response['message'];
      } else {
        message = exception.message;
      }

      originalMessage = message; // Сохраняем для логов
      statusCode = exception.getStatus();

      // Проверяем isOperational для HttpApiError
      if (exception instanceof HttpApiError && !exception.isOperational) {
        // Для неоперационных ошибок показываем стандартное сообщение
        switch (statusCode) {
          case HttpStatus.BAD_REQUEST:
            message = 'Неверный запрос';
            break;
          case HttpStatus.UNAUTHORIZED:
            message = 'Не авторизован';
            break;
          case HttpStatus.FORBIDDEN:
            message = 'Доступ запрещен';
            break;
          case HttpStatus.NOT_FOUND:
            message = 'Ресурс не найден';
            break;
          case HttpStatus.CONFLICT:
            message = 'Конфликт данных';
            break;
          default:
            message = 'Внутренняя ошибка сервера';
        }
      }
    }

    // Обработка конкретных типов исключений
    else if (exception instanceof RpcError) {
      message = exception.json.error.details[0].message.replace('assertion failure with message: ', '');
      statusCode = exception.json.code;
    } else if (exception instanceof mongoose.Error) {
      statusCode = HttpStatus.BAD_REQUEST;
      message = exception.message;
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // Логирование ошибки - используем оригинальное сообщение для детального логирования
    const logMessage = exception instanceof HttpApiError && !exception.isOperational ? originalMessage : message;

    const logData = {
      message: `${logMessage}`,
      statusCode,
      stack: exception.stack,
      username: user?.username || null,
      operation: operationName || null,
      field: fieldName || null,
      path: path || null,
      locations,
    };

    if (statusCode === HttpStatus.UNAUTHORIZED) {
      logger.warn(logData);
    } else {
      logger.error(logData);
    }

    // Возвращение ошибки в формате GraphQL
    return new GraphQLError(message, {
      extensions: {
        code: statusCode,
        ...(process.env.NODE_ENV === 'development' && { stacktrace: exception.stack }),
      },
    });
  }
}
