/* eslint-disable @typescript-eslint/no-explicit-any */
import { LoggerService } from '@nestjs/common';
import logger from '../../config/logger';

export class WinstonLoggerService implements LoggerService {
  log(message: string, ...meta: any[]) {
    logger.info(message, ...meta);
  }

  error(message: string, trace?: string, ...meta: any[]) {
    logger.error(message, { trace, ...meta });
  }

  warn(message: string, ...meta: any[]) {
    logger.warn(message, ...meta);
  }

  debug?(message: string, ...meta: any[]) {
    logger.debug(message, ...meta);
  }

  verbose?(message: string, ...meta: any[]) {
    logger.verbose(message, ...meta);
  }
}
