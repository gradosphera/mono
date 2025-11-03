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

    // Получаем публичный ключ из приватного в разных форматах
    const publicKeyObj = PrivateKey.fromString(data.wif).toPublic();
    const publicKeyLegacy = publicKeyObj.toLegacyString(); // EOS6... формат
    const publicKeyK1 = publicKeyObj.toString(); // PUB_K1_... формат

    // Проверяем, что ключ есть в активных разрешениях
    const hasKey = this.hasActiveKey(blockchainAccount, publicKeyLegacy, publicKeyK1);

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

  private hasActiveKey(account: any, publicKeyLegacy: string, publicKeyK1: string): boolean {
    // Преобразуем объект аккаунта в обычный JSON для работы со строками
    const accountJson = JSON.parse(JSON.stringify(account));

    const activePermission = accountJson.permissions?.find((perm: any) => perm.perm_name === 'active');

    if (!activePermission) return false;

    let keysArray: any[] = [];

    if (activePermission.required_auth?.keys) {
      keysArray = activePermission.required_auth.keys;
    } else if (Array.isArray(activePermission.required_auth)) {
      keysArray = activePermission.required_auth;
    } else {
      return false;
    }

    // Проверяем оба формата ключа
    const hasLegacyKey = keysArray.some((key: any) => key.key === publicKeyLegacy);
    const hasK1Key = keysArray.some((key: any) => key.key === publicKeyK1);

    return hasLegacyKey || hasK1Key;
  }
}
