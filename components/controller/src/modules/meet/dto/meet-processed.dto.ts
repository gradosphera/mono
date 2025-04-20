import { Field, ObjectType } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';
import { BlockchainActionDTO } from '~/modules/common/dto/blockchain-action.dto';

@ObjectType('MeetProcessed')
export class MeetProcessedDTO {
  @Field(() => String)
  hash!: string;

  @Field(() => BlockchainActionDTO)
  decision!: BlockchainActionDTO; //TODO: занести генератор DTO сюда чтобы получить типизированный результат по полям действия

  // @Field(() => Object, { nullable: true })
  // @IsOptional()
  // documents?: object[];

  constructor(data: MeetProcessedDTO) {
    Object.assign(this, data);
  }
}
