import { ObjectType, Field } from '@nestjs/graphql';
import type { SystemInfoDomainEntity } from '~/domain/system/entities/systeminfo-domain.entity';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { BlockchainInfoDTO } from './blockchain-info.dto';
import { CooperativeOperatorAccountDTO } from '../../common/dto/cooperator-account.dto';
import { SystemStatus } from './system-status.dto';
import { BlockchainAccountDTO } from '../../account/dto/blockchain-account.dto';
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

  @Field(() => BlockchainAccountDTO, { description: 'Объект системного аккаунта кооператива в блокчейне' })
  @ValidateNested()
  @Type(() => BlockchainAccountDTO)
  public readonly blockchain_account: BlockchainAccountDTO;

  @Field(() => SystemStatus, { description: 'Статус контроллера кооператива' })
  @IsBoolean()
  public readonly system_status: SystemStatus;

  constructor(entity: SystemInfoDomainEntity) {
    this.coopname = entity.coopname;
    this.blockchain_info = new BlockchainInfoDTO(entity.blockchain_info);
    this.system_status = entity.system_status as SystemStatus;
    this.blockchain_account = entity.blockchain_account;
    this.cooperator_account = new CooperativeOperatorAccountDTO({ ...entity.cooperator_account, ...entity.user_account });
  }
}
