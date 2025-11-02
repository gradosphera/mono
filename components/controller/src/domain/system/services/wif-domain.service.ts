import { Injectable, UnauthorizedException } from '@nestjs/common';
import Vault, { wifPermissions } from '~/models/vault.model';
import { PrivateKey } from '@wharfkit/antelope';
import type { SetWifInputDomainInterface } from '../interfaces/set-wif-input-domain.interface';
import { AccountDomainService } from '~/domain/account/services/account-domain.service';

@Injectable()
export class WifDomainService {
  constructor(private readonly accountDomainService: AccountDomainService) {}

  async setWif(data: SetWifInputDomainInterface): Promise<void> {
    // Получаем аккаунт из блокчейна
    const blockchainAccount = await this.accountDomainService.getBlockchainAccount(data.username);

    // Получаем публичный ключ из приватного
    const publicKey = PrivateKey.fromString(data.wif).toPublic().toLegacyString();

    // Проверяем, что ключ есть в активных разрешениях
    const hasKey = this.hasActiveKey(blockchainAccount, publicKey);

    if (!hasKey) {
      throw new UnauthorizedException('Неверный приватный ключ');
    }

    // Сохраняем ключ в зашифрованном хранилище
    await Vault.setWif(
      data.username,
      data.wif,
      data.permission ? (data.permission as wifPermissions) : wifPermissions.Active
    );
  }

  private hasActiveKey(account: any, publicKey: string): boolean {
    const activePermission = account.permissions?.find((perm: any) => perm.perm_name === 'active');

    if (!activePermission) return false;

    return activePermission.required_auth.keys.some((key: any) => key.key === publicKey);
  }
}
