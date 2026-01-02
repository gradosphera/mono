// domain/system/system-domain.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { SystemDomainInteractor } from './interactors/system.interactor';
import { AccountDomainModule } from '../account/account-domain.module';
import { SystemDomainService } from './services/system-domain.service';
import { SettingsDomainModule } from '../settings/settings-domain.module';
import { InstallDomainService } from './services/install-domain.service';
import { InitDomainService } from './services/init-domain.service';
import { WifDomainService } from './services/wif-domain.service';
import { VARS_REPOSITORY } from '../common/repositories/vars.repository';
import { VarsRepositoryImplementation } from '~/infrastructure/database/generator-repositories/repositories/vars-generator.repository';
import { ORGANIZATION_REPOSITORY } from '../common/repositories/organization.repository';
import { OrganizationRepositoryImplementation } from '~/infrastructure/database/generator-repositories/repositories/organization-generator.repository';
import { MONO_STATUS_REPOSITORY, MonoStatusRepositoryImpl } from '../common/repositories/mono-status.repository';
import { SYSTEM_BLOCKCHAIN_PORT } from './interfaces/system-blockchain.port';
import { SystemBlockchainAdapter } from '~/infrastructure/blockchain/adapters/system.adapter';
import { AccountDomainService, ACCOUNT_DOMAIN_SERVICE } from '~/domain/account/services/account-domain.service';
import { TokenApplicationModule } from '~/application/token/token-application.module';
import { UserDomainModule } from '~/domain/user/user-domain.module';
import { VaultDomainModule } from '~/domain/vault/vault-domain.module';
import { PaymentMethodInfrastructureModule } from '~/infrastructure/payment-method/payment-method-infrastructure.module';

@Module({
  imports: [
    forwardRef(() => AccountDomainModule),
    forwardRef(() => SettingsDomainModule),
    PaymentMethodInfrastructureModule,
    TokenApplicationModule,
    UserDomainModule,
    VaultDomainModule,
  ],
  providers: [
    { provide: ACCOUNT_DOMAIN_SERVICE, useExisting: AccountDomainService },
    { provide: SYSTEM_BLOCKCHAIN_PORT, useClass: SystemBlockchainAdapter },
    SystemDomainService,
    { provide: VARS_REPOSITORY, useClass: VarsRepositoryImplementation },
    { provide: ORGANIZATION_REPOSITORY, useClass: OrganizationRepositoryImplementation },
    { provide: MONO_STATUS_REPOSITORY, useClass: MonoStatusRepositoryImpl },
    { provide: InstallDomainService, useClass: InstallDomainService },
    InitDomainService,
    WifDomainService,
    SystemDomainInteractor,
  ],
  exports: [SystemDomainService, SystemDomainInteractor, SYSTEM_BLOCKCHAIN_PORT],
})
export class SystemDomainModule {}
