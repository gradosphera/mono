import { Catch, HttpException, HttpStatus } from '@nestjs/common';
import { GqlExceptionFilter } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';
import mongoose from 'mongoose';
import { RpcError } from 'eosjs';
import logger from '../config/logger';

@Catch()
export class GraphQLExceptionFilter implements GqlExceptionFilter {
  catch(exception: any) {
    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal Server Error';

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
    logger.error({
      message: `GraphQL Error: ${message}`,
      statusCode,
      stack: exception.stack,
    });

    console.log('on FILTER!');

    // Возвращение ошибки в формате GraphQL
    return new GraphQLError(message, {
      extensions: {
        code: statusCode,
        ...(process.env.NODE_ENV === 'development' && { stacktrace: exception.stack }),
      },
    });
  }
}
