import { ObjectType, Field } from '@nestjs/graphql';
import type { SystemInfoDomainEntity } from '~/domain/system/entities/systeminfo-domain.entity';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { BlockchainInfoDTO } from './blockchain-info.dto';
import { CooperativeOperatorAccountDTO } from '../../common/dto/cooperator-account.dto';
import { SystemStatus } from './system-status.dto';
import { BlockchainAccountDTO } from '../../account/dto/blockchain-account.dto';
import { Type } from 'class-transformer';
import { ContactsDTO } from './contacts.dto';
import { VarsDTO } from './vars.dto';

@ObjectType('SystemInfo')
export class SystemInfoDTO {
  @Field(() => String, { description: 'Имя аккаунта кооператива' })
  @IsString()
  public readonly coopname: string;

  @Field(() => ContactsDTO, { description: 'Контакты кооператива', nullable: true })
  @ValidateNested()
  public readonly contacts?: ContactsDTO;

  @Field(() => VarsDTO, { description: 'Переменные кооператива', nullable: true })
  @ValidateNested()
  public readonly vars?: VarsDTO | null;

  @Field(() => BlockchainInfoDTO, { description: 'Набор данных с информацией о состоянии блокчейна' })
  @ValidateNested()
  public readonly blockchain_info: BlockchainInfoDTO;

  @Field(() => CooperativeOperatorAccountDTO, { description: 'Объект аккаунта кооператива у оператора' })
  @ValidateNested()
  public readonly cooperator_account: CooperativeOperatorAccountDTO;

  @Field(() => BlockchainAccountDTO, { description: 'Объект системного аккаунта кооператива в блокчейне' })
  @ValidateNested()
  @Type(() => BlockchainAccountDTO)
  public readonly blockchain_account: BlockchainAccountDTO;

  @Field(() => SystemStatus, { description: 'Статус контроллера кооператива' })
  @IsBoolean()
  public readonly system_status: SystemStatus;

  constructor(entity: SystemInfoDomainEntity) {
    this.coopname = entity.coopname;
    this.contacts = entity.contacts;
    this.vars = entity.vars;
    this.blockchain_info = new BlockchainInfoDTO(entity.blockchain_info);
    this.system_status = entity.system_status as SystemStatus;
    this.blockchain_account = entity.blockchain_account;
    this.cooperator_account = new CooperativeOperatorAccountDTO({ ...entity.cooperator_account, ...entity.user_account });
  }
}
