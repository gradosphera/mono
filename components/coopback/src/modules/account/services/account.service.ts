import { Injectable } from '@nestjs/common';
import { AccountDTO } from '../dto/account.dto';
import { AccountDomainInteractor } from '~/domain/account/interactors/account.interactor';

@Injectable()
export class AccountService {
  constructor(private readonly accountDomainInteractor: AccountDomainInteractor) {}

  public async getAccount(username: string): Promise<AccountDTO> {
    const account = await this.accountDomainInteractor.getAccount(username);

    return new AccountDTO(account);
  }
}
