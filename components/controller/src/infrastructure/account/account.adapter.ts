import { Injectable } from '@nestjs/common';
import { AccountInteractor } from '~/application/account/interactors/account.interactor';
import { AccountDomainPort } from '~/domain/account/ports/account-domain.port';

@Injectable()
export class AccountAdapter implements AccountDomainPort {
  constructor(private readonly accountInteractor: AccountInteractor) {}

  async registerBlockchainAccount(username: string): Promise<void> {
    return await this.accountInteractor.registerBlockchainAccount(username);
  }
}
