import { RegistratorContract, type SovietContract } from 'cooptypes';
import type { BlockchainAccountInterface } from '~/types/shared';
import type { MonoAccountDomainInterface } from '../interfaces/mono-account-domain.interface';
import type { PrivateAccountDomainInterface } from '../interfaces/private-account-domain.interface';

export class AccountDomainEntity {
  public readonly username!: string;
  public blockchain_account!: BlockchainAccountInterface | null;
  public user_account!: RegistratorContract.Tables.Accounts.IAccount | null;
  public provider_account!: MonoAccountDomainInterface | null;
  public participant_account!: SovietContract.Tables.Participants.IParticipants | null;
  public private_account!: PrivateAccountDomainInterface | null;

  constructor(data: AccountDomainEntity) {
    Object.assign(this, data);
  }
}
