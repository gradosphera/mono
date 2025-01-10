import { ObjectType, Field } from '@nestjs/graphql';
import { IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { BlockchainAccountDTO } from '~/modules/account/dto/blockchain-account.dto';
import type { AccountDomainEntity } from '~/domain/account/entities/account-domain.entity';
import { ProviderAccountDTO } from './mono-account.dto';
import { UserAccountDTO } from '~/modules/account/dto/base-user-account.dto';
import { ParticipantAccountDTO } from './participant-account.dto';

@ObjectType('Account')
export class AccountDTO {
  @Field(() => String, { description: 'Имя аккаунта кооператива' })
  @IsString()
  public readonly username: string;

  @Field(() => BlockchainAccountDTO, {
    description:
      'объект аккаунта в блокчейне содержит системную информацию, такую как публичные ключи доступа, доступные вычислительные ресурсы, информация об установленном смарт-контракте, и т.д. и т.п. Это системный уровень обслуживания, где у каждого пайщика есть аккаунт, но не каждый аккаунт может быть пайщиком в каком-либо кооперативе. Все смарт-контракты устанавливаются и исполняются на этом уровне.',
    nullable: true,
  })
  @ValidateNested()
  @Type(() => BlockchainAccountDTO)
  public readonly blockchain_account!: BlockchainAccountDTO | null;

  @Field(() => UserAccountDTO, {
    description:
      'объект пользователя кооперативной экономики содержит в блокчейне информацию о типе аккаунта пайщика, а также, обезличенные публичные данные (хэши) для верификации пайщиков между кооперативами. Этот уровень предназначен для хранения информации пайщика, которая необходима всем кооперативам, но не относится к какому-либо из них конкретно.',
    nullable: true,
  })
  @ValidateNested()
  @Type(() => UserAccountDTO)
  public readonly user_account!: UserAccountDTO | null;

  @Field(() => ProviderAccountDTO, {
    description:
      'объект аккаунта в системе учёта провайдера, т.е. MONO. Здесь хранится приватная информация о пайщике кооператива, которая содержит его приватные данные. Эти данные не публикуются в блокчейне и не выходят за пределы базы данных провайдера. Они используются для заполнения шаблонов документов при нажатии соответствующих кнопок на платформе. ',
    nullable: true,
  })
  @ValidateNested()
  @Type(() => ProviderAccountDTO)
  public readonly provider_account!: ProviderAccountDTO | null;

  @Field(() => ParticipantAccountDTO, {
    description:
      'объект пайщика кооператива в таблице блокчейне, который определяет членство пайщика в конкретном кооперативе. Поскольку MONO обслуживает только один кооператив, то в participant_account обычно содержится информация, которая описывает членство пайщика в этом кооперативе. Этот объект обезличен, публичен, и хранится в блокчейне.',
    nullable: true,
  })
  @ValidateNested()
  @Type(() => ParticipantAccountDTO)
  public readonly participant_account!: ParticipantAccountDTO | null;

  constructor(entity: AccountDomainEntity) {
    this.username = entity.username;
    this.blockchain_account = entity.blockchain_account || null;
    this.provider_account = entity.provider_account ? new ProviderAccountDTO(entity.provider_account) : null;
    this.user_account = entity.user_account ? new UserAccountDTO(entity.user_account) : null;
    this.participant_account = entity.participant_account ? new ParticipantAccountDTO(entity.participant_account) : null;
    //TODO cardcoop_account
  }
}
