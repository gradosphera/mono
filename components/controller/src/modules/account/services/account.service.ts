import { Injectable } from '@nestjs/common';
import { AccountDTO } from '../dto/account.dto';
import { AccountDomainInteractor } from '~/domain/account/interactors/account.interactor';
import type { GetAccountsInputDTO } from '../dto/get-accounts-input.dto';
import type { PaginationInputDTO } from '~/modules/common/dto/pagination.dto';
import type { AccountDomainEntity } from '~/domain/account/entities/account-domain.entity';
import type { PaginationResultDomainInterface } from '~/domain/common/interfaces/pagination.interface';
import type { RegisterAccountInputDTO } from '../dto/register-account-input.dto';
import { RegisteredAccountDTO } from '../dto/registered-account.dto';
import type { DeleteAccountInputDTO } from '../dto/delete-account-input.dto';
import type { UpdateAccountInputDTO } from '../dto/update-account-input.dto';

@Injectable()
export class AccountService {
  constructor(private readonly accountDomainInteractor: AccountDomainInteractor) {}

  public async updateAccount(data: UpdateAccountInputDTO): Promise<AccountDTO> {
    const result = await this.accountDomainInteractor.updateAccount(data);
    return new AccountDTO(result);
  }

  public async deleteAccount(data: DeleteAccountInputDTO): Promise<void> {
    await this.accountDomainInteractor.deleteAccount(data.username_for_delete);
  }

  public async getAccount(username: string): Promise<AccountDTO> {
    const account = await this.accountDomainInteractor.getAccount(username);

    return new AccountDTO(account);
  }

  public async getAccounts(
    data?: GetAccountsInputDTO,
    options?: PaginationInputDTO
  ): Promise<PaginationResultDomainInterface<AccountDTO>> {
    const result = await this.accountDomainInteractor.getAccounts(data, options);

    return {
      ...result,
      items: result.items.map((account) => new AccountDTO(account)),
    };
  }

  public async registerAccount(data: RegisterAccountInputDTO): Promise<RegisteredAccountDTO> {
    const result = await this.accountDomainInteractor.registerAccount(data);
    return new RegisteredAccountDTO(result);
  }
}
