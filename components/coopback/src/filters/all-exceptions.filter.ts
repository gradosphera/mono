import { ExceptionFilter, Catch, HttpException, HttpStatus } from '@nestjs/common';
import { HttpApiError } from '../errors/http-api-error';
import mongoose from 'mongoose';
import { RpcError } from 'eosjs';
import logger from '../config/logger';
import config from '../config/config';

@Catch()
export class HttpApiExceptionFilter implements ExceptionFilter {
  catch(exception: any) {
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
    } else {
      // Обработка других ошибок
      exception = new HttpApiError(statusCode, message, true, exception.stack);
    }

    // Логируем ошибку
    logger.error(exception);

    // Бросаем отформатированную ошибку, чтобы GraphQL мог обработать её корректно
    throw new HttpException(
      {
        code: statusCode,
        message,
        subcode,
        ...(config.env === 'development' && { stack: exception.stack }),
      },
      statusCode
    );
  }
}
