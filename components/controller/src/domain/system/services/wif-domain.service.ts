import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { wifPermissions } from '~/domain/vault/types/vault.types';
import { PrivateKey } from '@wharfkit/antelope';
import type { SetWifInputDomainInterface } from '../interfaces/set-wif-input-domain.interface';
import { AccountDomainService } from '~/domain/account/services/account-domain.service';
import { BLOCKCHAIN_PORT, BlockchainPort } from '~/domain/common/ports/blockchain.port';
import { VaultDomainService, VAULT_DOMAIN_SERVICE } from '~/domain/vault/services/vault-domain.service';

@Injectable()
export class WifDomainService {
  constructor(
    private readonly accountDomainService: AccountDomainService,
    @Inject(BLOCKCHAIN_PORT) private readonly blockchainPort: BlockchainPort,
    @Inject(VAULT_DOMAIN_SERVICE) private readonly vaultDomainService: VaultDomainService
  ) {}

  async setWif(data: SetWifInputDomainInterface): Promise<void> {
    // Получаем аккаунт из блокчейна
    const blockchainAccount = await this.accountDomainService.getBlockchainAccount(data.username);

    // Получаем публичный ключ из приватного в PUB_K1_ формате (основной формат)
    const publicKeyObj = PrivateKey.fromString(data.wif).toPublic();
    const publicKeyK1 = publicKeyObj.toString(); // PUB_K1_... формат

    // Проверяем, что ключ есть в активных разрешениях
    const hasKey = this.blockchainPort.hasActiveKey(blockchainAccount, publicKeyK1);

    if (!hasKey) {
      throw new UnauthorizedException('Неверный приватный ключ');
    }

    // Сохраняем ключ в зашифрованном хранилище
    await this.vaultDomainService.setWif({
      username: data.username,
      wif: data.wif,
      permission: data.permission ? (data.permission as wifPermissions) : wifPermissions.Active,
    });
  }
}
