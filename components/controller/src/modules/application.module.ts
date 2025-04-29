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
import { DecisionModule } from './free-decision/decision.module';
import { AgreementModule } from './agreement/agreement.module';
import { ParticipantModule } from './participant/participant.module';
import { AgendaModule } from './agenda/agenda.module';
import { PaymentModule } from './payment/payment.module';
import { CooplaceModule } from './cooplace/cooplace.module';
import { DesktopModule } from './desktop/desktop.module';
import { MeetModule } from './meet/meet.module';

@Module({
  imports: [
    AccountModule,
    AgreementModule,
    AgendaModule,
    AppStoreModule,
    AuthModule,
    DesktopModule,
    BranchModule,
    LoggerModule,
    PaymentMethodModule,
    QueueModule,
    RedisAppModule,
    PaymentModule,
    SystemModule,
    DocumentModule,
    DecisionModule,
    ParticipantModule,
    CooplaceModule,
    MeetModule,
  ],
  exports: [
    AccountModule,
    AgendaModule,
    AgreementModule,
    AppStoreModule,
    AuthModule,
    BranchModule,
    DesktopModule,
    LoggerModule,
    PaymentMethodModule,
    PaymentModule,
    QueueModule,
    RedisAppModule,
    SystemModule,
    DocumentModule,
    DecisionModule,
    ParticipantModule,
    CooplaceModule,
    MeetModule,
  ],
})
export class ApplicationModule {}
