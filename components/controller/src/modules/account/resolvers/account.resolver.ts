import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { AccountService } from '../services/account.service';
import { AccountDTO } from '../dto/account.dto';
import { GetAccountInputDTO } from '../dto/get-account-input.dto';
import { UseGuards } from '@nestjs/common';
import { AuthRoles } from '~/modules/auth/decorators/auth.decorator';
import { GqlJwtAuthGuard } from '~/modules/auth/guards/graphql-jwt-auth.guard';
import { RolesGuard } from '~/modules/auth/guards/roles.guard';
import { createPaginationResult, PaginationInputDTO } from '~/modules/common/dto/pagination.dto';
import { GetAccountsInputDTO } from '../dto/get-accounts-input.dto';
import type { PaginationResultDomainInterface } from '~/domain/common/interfaces/pagination.interface';
import { RegisterAccountInputDTO } from '../dto/register-account-input.dto';
import { RegisteredAccountDTO } from '../dto/registered-account.dto';
import { UpdateAccountInputDTO } from '../dto/update-account-input.dto';
import { SearchPrivateAccountsInputDTO } from '../dto/search-private-accounts-input.dto';
import { PrivateAccountSearchResultDTO } from '../dto/search-private-accounts-result.dto';

export const AccountsPaginationResult = createPaginationResult(AccountDTO, 'Accounts');

@Resolver(() => AccountDTO)
export class AccountResolver {
  constructor(private readonly accountService: AccountService) {}

  @Query(() => AccountDTO, {
    name: 'getAccount',
    description: 'Получить сводную информацию о аккаунте',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman', 'member'])
  async getAccount(@Args('data', { type: () => GetAccountInputDTO }) input: GetAccountInputDTO): Promise<AccountDTO> {
    return this.accountService.getAccount(input.username);
  }

  @Query(() => AccountsPaginationResult, {
    name: 'getAccounts',
    description: 'Получить сводную информацию о аккаунтах системы',
  })
  async getAccounts(
    @Args('data', { type: () => GetAccountsInputDTO, nullable: true }) data?: GetAccountsInputDTO,
    @Args('options', { type: () => PaginationInputDTO, nullable: true }) options?: PaginationInputDTO
  ): Promise<PaginationResultDomainInterface<AccountDTO>> {
    return await this.accountService.getAccounts(data, options);
  }

  @Query(() => [PrivateAccountSearchResultDTO], {
    name: 'searchPrivateAccounts',
    description:
      'Поиск приватных данных аккаунтов по запросу. Поиск осуществляется по полям ФИО, ИНН, ОГРН, наименованию организации и другим приватным данным.',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman', 'member'])
  async searchPrivateAccounts(
    @Args('data', { type: () => SearchPrivateAccountsInputDTO }) data: SearchPrivateAccountsInputDTO
  ): Promise<PrivateAccountSearchResultDTO[]> {
    return this.accountService.searchPrivateAccounts(data);
  }

  @Mutation(() => RegisteredAccountDTO, {
    name: 'registerAccount',
    description: 'Зарегистрировать аккаунт пользователя в системе',
  })
  //TODO:
  // @UseGuards(GqlJwtAuthGuard, RolesGuard)
  async registerAccount(
    @Args('data', { type: () => RegisterAccountInputDTO })
    data: RegisterAccountInputDTO
  ): Promise<RegisteredAccountDTO> {
    return this.accountService.registerAccount(data);
  }

  // @Mutation(() => Boolean, {
  //   name: 'deleteAccount',
  //   description: 'Удалить аккаунт из системы учёта провайдера',
  // })
  // @UseGuards(GqlJwtAuthGuard, RolesGuard)
  // @AuthRoles(['chairman', 'member'])
  // async deleteAccount(
  //   @Args('data', { type: () => DeleteAccountInputDTO })
  //   data: DeleteAccountInputDTO
  // ): Promise<boolean> {
  //   await this.accountService.deleteAccount(data);

  //   return true;
  // }

  @Mutation(() => AccountDTO, {
    name: 'updateAccount',
    description:
      'Обновить аккаунт в системе провайдера. Обновление аккаунта пользователя производится по username. Мутация позволяет изменить приватные данные пользователя, а также, адрес электронной почты в MONO. Использовать мутацию может только председатель совета.',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman'])
  async updateAccount(
    @Args('data', { type: () => UpdateAccountInputDTO })
    data: UpdateAccountInputDTO
  ): Promise<AccountDTO> {
    return await this.accountService.updateAccount(data);
  }
}
