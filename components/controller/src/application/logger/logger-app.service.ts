import logger from '../../config/logger';
import { Injectable, Scope } from '@nestjs/common';
import { LoggerService as NestLoggerService } from '@nestjs/common';

@Injectable({ scope: Scope.TRANSIENT })
export class WinstonLoggerService implements NestLoggerService {
  private context?: string;

  setContext(context: string) {
    this.context = context;
  }

  log(message: string, metaOrError?: string | Error | Record<string, any>) {
    this.handleLogMessage(logger.info, message, metaOrError);
  }

  info(message: string, metaOrError?: string | Error | Record<string, any>) {
    this.handleLogMessage(logger.info, message, metaOrError);
  }

  error(message: string, errorOrTrace?: string | Error | Record<string, any>, meta?: string | Record<string, any>) {
    if (errorOrTrace instanceof Error) {
      logger.error(message, errorOrTrace);
    } else if (typeof errorOrTrace === 'string') {
      logger.error(message, { trace: errorOrTrace, context: this.context, ...(meta && { meta }) });
    } else if (errorOrTrace) {
      logger.error(message, { context: this.context, ...errorOrTrace, ...(meta && { meta }) });
    } else {
      logger.error(message, { context: this.context, ...(meta && { meta }) });
    }
  }

  warn(message: string, metaOrError?: string | Error | Record<string, any>) {
    this.handleLogMessage(logger.warn, message, metaOrError);
  }

  debug(message: string, metaOrError?: string | Error | Record<string, any>) {
    this.handleLogMessage(logger.debug, message, metaOrError);
  }

  verbose(message: string, metaOrError?: string | Error | Record<string, any>) {
    this.handleLogMessage(logger.verbose, message, metaOrError);
  }

  private handleLogMessage(loggerMethod: any, message: string, metaOrError?: string | Error | Record<string, any>) {
    if (metaOrError instanceof Error) {
      loggerMethod(message, { error: metaOrError, context: this.context });
    } else if (typeof metaOrError === 'string') {
      loggerMethod(message, { trace: metaOrError, context: this.context });
    } else if (metaOrError) {
      loggerMethod(message, { context: this.context, ...metaOrError });
    } else {
      loggerMethod(message, { context: this.context });
    }
  }
}
