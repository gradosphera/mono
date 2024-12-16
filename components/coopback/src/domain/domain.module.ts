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

@Module({
  imports: [
    AccountDomainModule,
    ExtensionDomainModule,
    PaymentDomainModule,
    PaymentMethodDomainModule,
    ProviderDomainModule,
    SystemDomainModule,
    BranchDomainModule,
    DocumentDomainModule,
  ],
  exports: [
    AccountDomainModule,
    ExtensionDomainModule,
    PaymentDomainModule,
    PaymentMethodDomainModule,
    ProviderDomainModule,
    SystemDomainModule,
    BranchDomainModule,
    DocumentDomainModule,
  ],
})
export class DomainModule {}
