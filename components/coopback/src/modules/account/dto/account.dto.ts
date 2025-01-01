import { ObjectType, Field } from '@nestjs/graphql';
import { IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { BlockchainAccountDTO } from '~/modules/account/dto/blockchain-account.dto';
import type { AccountDomainEntity } from '~/domain/account/entities/account-domain.entity';
import { MonoAccountDTO } from './mono-account.dto';
import { UserAccountDTO } from '~/modules/account/dto/base-user-account.dto';
import { ParticipantAccountDTO } from './participant-account.dto';

@ObjectType('Account')
export class AccountDTO {
  @Field(() => String, { description: 'Имя аккаунта кооператива' })
  @IsString()
  public readonly username: string;

  @Field(() => BlockchainAccountDTO, { description: 'Объект системного аккаунта кооператива в блокчейне', nullable: true })
  @ValidateNested()
  @Type(() => BlockchainAccountDTO)
  public readonly blockchain_account!: BlockchainAccountDTO | null;

  @Field(() => UserAccountDTO, {
    description: 'Объект пользовательского аккаунта кооперативной экономики',
    nullable: true,
  })
  @ValidateNested()
  @Type(() => UserAccountDTO)
  public readonly user_account!: UserAccountDTO | null;

  @Field(() => MonoAccountDTO, { description: 'Объект аккаунта в системе учёта провайдера', nullable: true })
  @ValidateNested()
  @Type(() => MonoAccountDTO)
  public readonly provider_account!: MonoAccountDTO | null;

  @Field(() => ParticipantAccountDTO, { description: 'Объект пайщика кооператива', nullable: true })
  @ValidateNested()
  @Type(() => ParticipantAccountDTO)
  public readonly participant_account!: ParticipantAccountDTO | null;

  constructor(entity: AccountDomainEntity) {
    this.username = entity.username;
    this.blockchain_account = entity.blockchain_account || null;
    this.provider_account = entity.provider_account ? new MonoAccountDTO(entity.provider_account) : null;
    this.user_account = entity.user_account ? new UserAccountDTO(entity.user_account) : null;
    this.participant_account = entity.participant_account ? new ParticipantAccountDTO(entity.participant_account) : null;
    //TODO cardcoop_account
  }
}
