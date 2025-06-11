import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { AccountExtensionPort } from '../ports/account-extension-port';
import { AccountDomainInteractor } from '~/domain/account/interactors/account.interactor';
import { AccountDomainEntity } from '~/domain/account/entities/account-domain.entity';
import { PaginationInputDTO } from '~/modules/common/dto/pagination.dto';
import { PaginationResultDomainInterface } from '~/domain/common/interfaces/pagination.interface';
import type { GetAccountsInputDomainInterface } from '~/domain/account/interfaces/get-accounts-input.interface';

@Injectable()
export class AccountExtensionAdapter implements AccountExtensionPort {
  constructor(
    @Inject(forwardRef(() => AccountDomainInteractor)) private readonly accountInteractor: AccountDomainInteractor
  ) {}

  async getAccounts(
    data: GetAccountsInputDomainInterface = {},
    options?: PaginationInputDTO
  ): Promise<PaginationResultDomainInterface<AccountDomainEntity>> {
    return this.accountInteractor.getAccounts(data, options);
  }
}
