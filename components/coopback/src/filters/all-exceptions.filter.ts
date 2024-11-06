// src/filters/http-api-exception.filter.ts
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { HttpApiError } from '../errors/http-api-error';
import mongoose from 'mongoose';
import { RpcError } from 'eosjs';
import logger from '../config/logger';
import config from '../config/config';

@Catch()
export class HttpApiExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal Server Error';
    let subcode: any = undefined;

    // Конвертация ошибок в HttpApiError
    if (exception instanceof HttpApiError) {
      statusCode = exception.getStatus();
      message = exception.message;
      subcode = exception.subcode;
    } else if (exception instanceof RpcError) {
      message = exception.json.error.details[0].message.replace('assertion failure with message: ', '');
      statusCode = exception.json.code;
      subcode = exception.json.error.code;
      exception = new HttpApiError(statusCode, message, true, exception.stack, subcode);
    } else if (exception instanceof mongoose.Error) {
      statusCode = HttpStatus.BAD_REQUEST;
      message = exception.message;
      exception = new HttpApiError(statusCode, message, true, exception.stack);
    } else if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      message = exception.message;
    }

    // Формат ответа
    const errorResponse = {
      code: statusCode,
      message,
      subcode,
      ...(config.env === 'development' && { stack: exception.stack }),
    };

    logger.error(exception);
    response.status(statusCode).json(errorResponse);
  }
}
