import logger from '../../config/logger';
import { Injectable, Scope } from '@nestjs/common';
import { LoggerService as NestLoggerService } from '@nestjs/common';

@Injectable({ scope: Scope.TRANSIENT })
export class WinstonLoggerService implements NestLoggerService {
  private context?: string;

  setContext(context: string) {
    this.context = context;
  }

  log(message: string, meta?: string | Record<string, any>) {
    logger.info(message, { context: this.context, ...(meta && { meta }) });
  }

  error(message: string, trace?: string, meta?: string | Record<string, any>) {
    logger.error(message, { trace, context: this.context, ...(meta && { meta }) });
  }

  warn(message: string, meta?: string | Record<string, any>) {
    logger.warn(message, { context: this.context, ...(meta && { meta }) });
  }

  debug(message: string, meta?: string | Record<string, any>) {
    logger.debug(message, { context: this.context, ...(meta && { meta }) });
  }

  verbose(message: string, meta?: string | Record<string, any>) {
    logger.verbose(message, { context: this.context, ...(meta && { meta }) });
  }
}
