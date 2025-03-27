import { AccountDomainEntity } from '../entities/account-domain.entity';
import config from '~/config/config';
import { AccountDomainService } from '~/domain/account/services/account-domain.service';
import { Inject, Injectable } from '@nestjs/common';
import { tokenService, userService } from '~/services';
import type { MonoAccountDomainInterface } from '../interfaces/mono-account-domain.interface';
import type { GetAccountsInputDomainInterface } from '../interfaces/get-accounts-input.interface';
import type {
  PaginationInputDomainInterface,
  PaginationResultDomainInterface,
} from '~/domain/common/interfaces/pagination.interface';
import type { QueryResultLegacy } from '~/domain/common/interfaces/query-result-legacy-domain.interface';
import type { RegisterAccountDomainInterface } from '../interfaces/register-account-input.interface';
import type { RegisteredAccountDomainInterface } from '../interfaces/registeted-account.interface';
import type { UpdateAccountDomainInterface } from '../interfaces/update-account-input.interface';
import { AccountType } from '~/modules/account/enum/account-type.enum';
import { ORGANIZATION_REPOSITORY, OrganizationRepository } from '~/domain/common/repositories/organization.repository';
import { INDIVIDUAL_REPOSITORY, IndividualRepository } from '~/domain/common/repositories/individual.repository';
import { ENTREPRENEUR_REPOSITORY, EntrepreneurRepository } from '~/domain/common/repositories/entrepreneur.repository';
import { IndividualDomainEntity } from '~/domain/branch/entities/individual-domain.entity';
import { OrganizationDomainEntity } from '~/domain/branch/entities/organization-domain.entity';
import { EntrepreneurDomainEntity } from '~/domain/branch/entities/entrepreneur-domain.entity';

@Injectable()
export class AccountDomainInteractor {
  constructor(
    private readonly accountDomainService: AccountDomainService,
    @Inject(ORGANIZATION_REPOSITORY) private readonly organizationRepository: OrganizationRepository,
    @Inject(INDIVIDUAL_REPOSITORY) private readonly individualRepository: IndividualRepository,
    @Inject(ENTREPRENEUR_REPOSITORY) private readonly entrepreneurRepository: EntrepreneurRepository
  ) {}

  async updateAccount(data: UpdateAccountDomainInterface): Promise<AccountDomainEntity> {
    const exist = await this.getAccount(data.username);

    if (!exist.provider_account) throw new Error(`Аккаунт провайдера не найден для обновления`);

    // обновляем данные в хранилище
    if (exist.provider_account?.type === 'individual' && data.individual_data) {
      //здесь и далее мы подставляем email и username т.к. они требуются в интерфесе генератора
      const individual = new IndividualDomainEntity({ ...data.individual_data, username: data.username });
      await this.individualRepository.create(individual);

      await userService.updateUserByUsername(data.username, {
        email: data.individual_data.email,
      });
    } else if (exist.provider_account?.type === 'organization' && data.organization_data) {
      const organization = new OrganizationDomainEntity({
        ...data.organization_data,
        username: data.username,
      });
      await this.organizationRepository.create(organization);

      await userService.updateUserByUsername(data.username, {
        email: data.organization_data.email,
      });
    } else if (exist.provider_account?.type === 'entrepreneur' && data.entrepreneur_data) {
      const entrepreneur = new EntrepreneurDomainEntity({
        ...data.entrepreneur_data,
        username: data.username,
      });
      await this.entrepreneurRepository.create(entrepreneur);

      await userService.updateUserByUsername(data.username, {
        email: data.entrepreneur_data.email,
      });
    }

    return await this.getAccount(data.username);
  }

  async deleteAccount(username: string): Promise<void> {
    await userService.deleteUserByUsername(username);
  }

  async registerAccount(data: RegisterAccountDomainInterface): Promise<RegisteredAccountDomainInterface> {
    //TODO refactor after migrate from mongo
    const user = await userService.createUser({ ...data, role: 'user' });
    const tokens = await tokenService.generateAuthTokens(user);

    const account = await this.getAccount(data.username);

    const result: RegisteredAccountDomainInterface = {
      account,
      tokens,
    };

    return result;
  }

  async getAccount(username: string): Promise<AccountDomainEntity> {
    return await this.accountDomainService.getAccount(username);
  }

  async getAccounts(
    data: GetAccountsInputDomainInterface = {},
    options: PaginationInputDomainInterface = { page: 1, limit: 10, sortOrder: 'DESC' }
  ): Promise<PaginationResultDomainInterface<AccountDomainEntity>> {
    const provider_accounts = (await userService.queryUsers(data, options)) as QueryResultLegacy<MonoAccountDomainInterface>;

    const result: PaginationResultDomainInterface<AccountDomainEntity> = {
      items: [],
      totalCount: provider_accounts.totalResults,
      totalPages: provider_accounts.totalPages,
      currentPage: provider_accounts.page,
    };

    for (const account of provider_accounts.results) {
      const item = await this.accountDomainService.getAccount(account.username);
      result.items.push(item);
    }

    return result;
  }
}
