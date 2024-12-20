import { Resolver, Query, Args } from '@nestjs/graphql';
import { AccountService } from '../services/account.service';
import { AccountDTO } from '../dto/account.dto';
import { GetAccountInputDTO } from '../dto/get-account-input.dto';
import { UseGuards } from '@nestjs/common';
import { AuthRoles } from '~/modules/auth/decorators/auth.decorator';
import { GqlJwtAuthGuard } from '~/modules/auth/guards/graphql-jwt-auth.guard';
import { RolesGuard } from '~/modules/auth/guards/roles.guard';

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
}
