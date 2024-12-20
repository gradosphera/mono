import { AccountDomainEntity } from '../entities/account-domain.entity';
import config from '~/config/config';
import { AccountDomainService } from '~/domain/account/services/account-domain.service';
import { Injectable } from '@nestjs/common';
import { userService } from '~/services';
import type { MonoAccountDomainInterface } from '../interfaces/mono-account-domain.interface';

@Injectable()
export class AccountDomainInteractor {
  constructor(private readonly accountDomainService: AccountDomainService) {}

  async getAccount(username: string): Promise<AccountDomainEntity> {
    const user_account = await this.accountDomainService.getUserAccount(username);
    const blockchain_account = await this.accountDomainService.getBlockchainAccount(username);
    const participant_account = await this.accountDomainService.getParticipantAccount(config.coopname, username);

    //TODO refactor after migrate from mongo
    const mono_account = (await userService.findUser(username)) as unknown as MonoAccountDomainInterface;

    return new AccountDomainEntity({
      username,
      user_account,
      blockchain_account,
      mono_account: mono_account,
      participant_account,
    });
  }
}
