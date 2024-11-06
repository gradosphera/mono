// src/errors/http-api-error.ts
import { HttpException, HttpStatus } from '@nestjs/common';

export class HttpApiError extends HttpException {
  public readonly isOperational: boolean;
  public readonly subcode: any;

  constructor(
    statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
    message = 'Internal Server Error',
    isOperational = true,
    stack?: string,
    subcode?: any
  ) {
    super(message, statusCode);
    this.isOperational = isOperational;
    this.subcode = subcode;

    // Захватываем стек, если он передан, иначе используем стандартный метод
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
