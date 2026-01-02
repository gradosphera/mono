import { Module } from '@nestjs/common';
import { VaultDomainAdapter } from './adapters/vault-domain.adapter';
import { VAULT_DOMAIN_PORT } from '~/domain/vault/ports/vault-domain.port';
import { VaultDomainModule } from '~/domain/vault/vault-domain.module';

@Module({
  imports: [VaultDomainModule], // для доступа к VaultDomainService
  providers: [
    VaultDomainAdapter,
    {
      provide: VAULT_DOMAIN_PORT,
      useClass: VaultDomainAdapter,
    },
  ],
  exports: [VAULT_DOMAIN_PORT],
})
export class VaultInfrastructureModule {}
