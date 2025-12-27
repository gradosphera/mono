import { Module } from '@nestjs/common';
import { VaultDomainService, VAULT_DOMAIN_SERVICE } from './services/vault-domain.service';

/**
 * Доменный модуль для работы с зашифрованными WIF ключами
 * Предоставляет доменные сервисы для безопасного хранения приватных ключей
 */
@Module({
  providers: [
    VaultDomainService,
    {
      provide: VAULT_DOMAIN_SERVICE,
      useExisting: VaultDomainService,
    },
  ],
  exports: [VaultDomainService, VAULT_DOMAIN_SERVICE],
})
export class VaultDomainModule {}
