import { ObjectType, Field } from '@nestjs/graphql';
import type { SystemInfoDomainEntity } from '~/domain/system/entities/systeminfo-domain.entity';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { BlockchainInfoDTO } from './blockchain-info.dto';
import { CooperativeOperatorAccountDTO } from './cooperator-account.dto';
import { SystemStatus } from './system-status.dto';
import { SystemAccountDTO } from './system-account.dto';
import { Type } from 'class-transformer';

@ObjectType('SystemInfo')
export class SystemInfoDTO {
  @Field(() => String, { description: 'Имя аккаунта кооператива' })
  @IsString()
  public readonly coopname: string;

  @Field(() => BlockchainInfoDTO, { description: 'Набор данных с информацией о состоянии блокчейна' })
  @IsString()
  public readonly blockchain_info: BlockchainInfoDTO;

  @Field(() => CooperativeOperatorAccountDTO, { description: 'Объект аккаунта кооператива у оператора' })
  @IsString()
  public readonly cooperator_account: CooperativeOperatorAccountDTO;

  @Field(() => SystemAccountDTO, { description: 'Объект системного аккаунта кооператива в блокчейне' })
  @ValidateNested()
  @Type(() => SystemAccountDTO)
  public readonly system_account: SystemAccountDTO;

  @Field(() => SystemStatus, { description: 'Статус контроллера кооператива' })
  @IsBoolean()
  public readonly system_status: SystemStatus;

  constructor(entity: SystemInfoDomainEntity) {
    this.coopname = entity.coopname;
    this.blockchain_info = new BlockchainInfoDTO(entity.blockchain_info);
    this.system_status = entity.system_status as SystemStatus;
    this.system_account = entity.system_account;
    this.cooperator_account = new CooperativeOperatorAccountDTO({ ...entity.cooperator_account, ...entity.user_account });
  }
}
