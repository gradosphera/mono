import { Catch, HttpException, HttpStatus, ExecutionContext } from '@nestjs/common';
import { GqlExceptionFilter, GqlExecutionContext } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';
import mongoose from 'mongoose';
import { RpcError } from 'eosjs';
import logger from '../config/logger';

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
    if (exception instanceof HttpException) {
      const response = exception.getResponse();

      if (typeof response === 'object' && response['message']) {
        message = Array.isArray(response['message']) ? response['message'].join(', ') : response['message'];
      } else {
        message = exception.message;
      }

      statusCode = exception.getStatus();
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

    // Логирование ошибки
    const logData = {
      message: `GraphQL Error: ${message}`,
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
