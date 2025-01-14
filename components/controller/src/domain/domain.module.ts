// app.module.ts
import { Module } from '@nestjs/common';
import { AccountDomainModule } from './account/account-domain.module';
import { ExtensionDomainModule } from './extension/extension-domain.module';
import { PaymentDomainModule } from './payment/payment.module';
import { PaymentMethodDomainModule } from './payment-method/payment-method-domain.module';
import { ProviderDomainModule } from './provider/provider.module';
import { SystemDomainModule } from './system/system-domain.module';
import { BranchDomainModule } from './branch/branch-domain.module';
import { DocumentDomainModule } from './document/document.module';
import { FreeDecisionDomainModule } from './free-decision/free-decision.module';
import { AgreementDomainModule } from './agreement/agreement-domain.module';
import { ParticipantDomainModule } from './participant/participant-domain.module';
import { AuthDomainModule } from './auth/auth.module';
import { AgendaDomainModule } from './agenda/agenda-domain.module';

@Module({
  imports: [
    AuthDomainModule,
    AgendaDomainModule,
    AccountDomainModule,
    AgreementDomainModule,
    ExtensionDomainModule,
    PaymentDomainModule,
    PaymentMethodDomainModule,
    ProviderDomainModule,
    SystemDomainModule,
    BranchDomainModule,
    DocumentDomainModule,
    FreeDecisionDomainModule,
    ParticipantDomainModule,
  ],
  exports: [
    AuthDomainModule,
    AgendaDomainModule,
    AccountDomainModule,
    AgreementDomainModule,
    ExtensionDomainModule,
    PaymentDomainModule,
    PaymentMethodDomainModule,
    ProviderDomainModule,
    SystemDomainModule,
    BranchDomainModule,
    DocumentDomainModule,
    FreeDecisionDomainModule,
    ParticipantDomainModule,
  ],
})
export class DomainModule {}
