//logger-app.module.ts

import { Global, Module } from '@nestjs/common';
import { WinstonLoggerService } from './logger-app.service';

@Global()
@Module({
  providers: [WinstonLoggerService],
  exports: [WinstonLoggerService],
})
export class LoggerModule {}
