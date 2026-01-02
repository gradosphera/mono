import type { VaultDomainEntity } from '../entities/vault-domain.entity';

export const VAULT_DOMAIN_PORT = Symbol('VAULT_DOMAIN_PORT');

export interface VaultDomainPort {
  getWif(username: string): Promise<string | null>;
  setWif(vault: VaultDomainEntity): Promise<boolean>;
}
