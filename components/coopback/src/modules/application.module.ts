// app.module.ts
import { Module } from '@nestjs/common';
import { AccountModule } from './account/account.module';
import { AuthModule } from './auth/auth.module';
import { BranchModule } from './branch/branch.module';
import { LoggerModule } from './logger/logger-app.module';
import { PaymentMethodModule } from './payment-method/payment-method.module';
import { RedisModule } from '~/infrastructure/redis/redis.module';
import { SystemModule } from './system/system.module';
import { AppStoreModule } from './appstore/appstore-app.module';
import { QueueModule } from './queue/queue-app.module';
import { DocumentModule } from './document/document.module';

@Module({
  imports: [
    AccountModule,
    AppStoreModule,
    AuthModule,
    BranchModule,
    LoggerModule,
    PaymentMethodModule,
    QueueModule,
    RedisModule,
    SystemModule,
    DocumentModule,
  ],
  exports: [
    AccountModule,
    AppStoreModule,
    AuthModule,
    BranchModule,
    LoggerModule,
    PaymentMethodModule,
    QueueModule,
    RedisModule,
    SystemModule,
    DocumentModule,
  ],
})
export class ApplicationModule {}
