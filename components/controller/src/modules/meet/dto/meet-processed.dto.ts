import { Field, ObjectType } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';
import { BlockchainActionDTO } from '~/modules/common/dto/blockchain-action.dto';

@ObjectType('MeetProcessed', { description: 'Данные о собрании после обработки' })
export class MeetProcessedDTO {
  @Field(() => String, { description: 'Хеш собрания' })
  hash!: string;

  @Field(() => BlockchainActionDTO, { description: 'Решение по собранию в формате блокчейн-действия' })
  decision!: BlockchainActionDTO; //TODO: занести генератор DTO сюда чтобы получить типизированный результат по полям действия

  // @Field(() => Object, { nullable: true })
  // @IsOptional()
  // documents?: object[];

  constructor(data: MeetProcessedDTO) {
    Object.assign(this, data);
  }
}
