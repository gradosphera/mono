import { AccountDomainEntity } from '~/domain/account/entities/account-domain.entity';
import { PaginationInputDTO } from '~/modules/common/dto/pagination.dto';
import { PaginationResultDomainInterface } from '~/domain/common/interfaces/pagination.interface';
import type { GetAccountsInputDomainInterface } from '~/domain/account/interfaces/get-accounts-input.interface';

export interface AccountExtensionPort {
  getAccounts(
    data: GetAccountsInputDomainInterface,
    options?: PaginationInputDTO
  ): Promise<PaginationResultDomainInterface<AccountDomainEntity>>;
}

export const ACCOUNT_EXTENSION_PORT = Symbol('AccountExtensionPort');
