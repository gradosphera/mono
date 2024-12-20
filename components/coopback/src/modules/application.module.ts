// app.module.ts
import { Module } from '@nestjs/common';
import { AccountModule } from './account/account.module';
import { AuthModule } from './auth/auth.module';
import { BranchModule } from './branch/branch.module';
import { LoggerModule } from './logger/logger-app.module';
import { PaymentMethodModule } from './payment-method/payment-method.module';
import { SystemModule } from './system/system.module';
import { AppStoreModule } from './appstore/appstore-app.module';
import { QueueModule } from './queue/queue-app.module';
import { DocumentModule } from './document/document.module';
import { RedisAppModule } from './redis/redis-app.module';
import { DecisionModule } from './decision/decision.module';

@Module({
  imports: [
    AccountModule,
    AppStoreModule,
    AuthModule,
    BranchModule,
    LoggerModule,
    PaymentMethodModule,
    QueueModule,
    RedisAppModule,
    SystemModule,
    DocumentModule,
    DecisionModule,
  ],
  exports: [
    AccountModule,
    AppStoreModule,
    AuthModule,
    BranchModule,
    LoggerModule,
    PaymentMethodModule,
    QueueModule,
    RedisAppModule,
    SystemModule,
    DocumentModule,
    DecisionModule,
  ],
})
export class ApplicationModule {}
