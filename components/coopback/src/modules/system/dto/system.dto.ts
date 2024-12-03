import { ObjectType, Field } from '@nestjs/graphql';
import { SystemInfoDomainInterface } from '~/domain/system/interfaces/info-domain.interface';
import type { SystemInfoDomainEntity } from '~/domain/system/entities/info.entity';
import { IsString } from 'class-validator';
import { BlockchainInfoDTO } from './blockchain-info.dto';

@ObjectType('SystemInfo')
export class SystemInfoDTO implements SystemInfoDomainInterface {
  @Field(() => String, { description: 'Имя аккаунта кооператива' })
  @IsString()
  public readonly coopname: string;

  @Field(() => BlockchainInfoDTO, { description: 'Набор данных с информацией о состоянии блокчейна' })
  @IsString()
  public readonly blockchain: BlockchainInfoDTO;

  constructor(entity: SystemInfoDomainEntity) {
    this.coopname = entity.coopname;
    this.blockchain = new BlockchainInfoDTO(entity.blockchain);
  }
}
