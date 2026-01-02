import { Injectable } from '@nestjs/common';
import type { VaultDomainPort } from '~/domain/vault/ports/vault-domain.port';
import type { VaultDomainEntity } from '~/domain/vault/entities/vault-domain.entity';
import { VaultDomainService } from '~/domain/vault/services/vault-domain.service';

@Injectable()
export class VaultDomainAdapter implements VaultDomainPort {
  constructor(private readonly vaultDomainService: VaultDomainService) {}

  async getWif(username: string): Promise<string | null> {
    return this.vaultDomainService.getWif(username);
  }

  async setWif(vault: VaultDomainEntity): Promise<boolean> {
    return this.vaultDomainService.setWif(vault);
  }
}
