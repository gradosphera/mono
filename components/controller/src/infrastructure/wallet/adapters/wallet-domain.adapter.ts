import { Injectable } from '@nestjs/common';
import { WalletInteractor } from '~/application/wallet/interactors/wallet.interactor';
import type { ProgramWalletDomainEntity } from '~/domain/wallet/entities/program-wallet-domain.entity';
import type { WalletDomainPort, ProgramWalletFilterDomainInterface } from '~/domain/wallet/ports/wallet-domain.port';

/**
 * Адаптер для предоставления доступа к данным программных кошельков
 * Связывает домен wallet с расширениями через портовую архитектуру
 */
@Injectable()
export class WalletDomainAdapter implements WalletDomainPort {
  constructor(private readonly walletInteractor: WalletInteractor) {}

  /**
   * Получить программный кошелек по фильтру
   */
  async getProgramWallet(filter: ProgramWalletFilterDomainInterface): Promise<ProgramWalletDomainEntity | null> {
    return await this.walletInteractor.getProgramWallet(filter);
  }

  /**
   * Получить список программных кошельков по фильтру
   */
  async getProgramWallets(filter: ProgramWalletFilterDomainInterface): Promise<ProgramWalletDomainEntity[]> {
    const result = await this.walletInteractor.getProgramWalletsPaginated(filter, {
      page: 1,
      limit: 1000,
      sortOrder: 'ASC' as const
    });
    return result.items;
  }
}
