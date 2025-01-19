import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import type { BlockchainAccountInterface } from '~/types/shared';
import { ACCOUNT_BLOCKCHAIN_PORT, type AccountBlockchainPort } from '../interfaces/account-blockchain.port';
import type { RegistratorContract, SovietContract } from 'cooptypes';
import config from '~/config/config';
import { AccountDomainEntity } from '../entities/account-domain.entity';
import type { MonoAccountDomainInterface } from '../interfaces/mono-account-domain.interface';
import { userService } from '~/services';
import type { RegisterAccountDomainInterface } from '../interfaces/register-account-input.interface';
import { userStatus } from '~/types';

@Injectable()
export class AccountDomainService {
  constructor(@Inject(ACCOUNT_BLOCKCHAIN_PORT) private readonly accountBlockchainPort: AccountBlockchainPort) {}

  async addProviderAccount(data: RegisterAccountDomainInterface): Promise<MonoAccountDomainInterface> {
    //TODO refactor it after migrate from mongo
    const user = await userService.createUser({ ...data, role: 'user' });
    user.status = userStatus['4_Registered'];
    user.is_registered = true;
    user.has_account = true;

    await user.save();
    return user as unknown as MonoAccountDomainInterface;
  }

  async addParticipantAccount(data: RegistratorContract.Actions.AddUser.IAddUser): Promise<void> {
    try {
      await this.accountBlockchainPort.addParticipantAccount(data);
    } catch (e: any) {
      // удаляем аккаунт провайдера если транзакция в блокчейн не прошла (для возможности повтора)
      await userService.deleteUserByUsername(data.username);
      throw new BadRequestException(e.message);
    }
  }

  async getAccount(username: string): Promise<AccountDomainEntity> {
    const user_account = await this.getUserAccount(username);
    const blockchain_account = await this.getBlockchainAccount(username);
    const participant_account = await this.getParticipantAccount(config.coopname, username);

    //TODO refactor after migrate from mongo
    const provider_account = (await userService.findUser(username)) as unknown as MonoAccountDomainInterface;

    return new AccountDomainEntity({
      username,
      user_account,
      blockchain_account,
      provider_account: provider_account,
      participant_account,
    });
  }

  async getBlockchainAccount(username: string): Promise<BlockchainAccountInterface | null> {
    return await this.accountBlockchainPort.getBlockchainAccount(username);
  }

  async getCooperatorAccount(username: string): Promise<RegistratorContract.Tables.Cooperatives.ICooperative | null> {
    return await this.accountBlockchainPort.getCooperatorAccount(username);
  }

  async getParticipantAccount(
    coopname: string,
    username: string
  ): Promise<SovietContract.Tables.Participants.IParticipants | null> {
    return await this.accountBlockchainPort.getParticipantAccount(coopname, username);
  }

  async getUserAccount(username: string): Promise<RegistratorContract.Tables.Accounts.IAccount | null> {
    return await this.accountBlockchainPort.getUserAccount(username);
  }
}
