import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { BaseOutputDTO } from '../base.dto';
/**
 * GraphQL Output DTO для сущности Vote
 */
@ObjectType('CapitalVote', {
  description: 'Голос в системе CAPITAL',
})
export class VoteOutputDTO extends BaseOutputDTO {
  @Field(() => Int, {
    nullable: true,
    description: 'ID в блокчейне',
  })
  id?: number;

  @Field(() => String, {
    nullable: true,
    description: 'Хеш проекта',
  })
  project_hash?: string;

  @Field(() => String, {
    nullable: true,
    description: 'Голосующий',
  })
  voter?: string;

  @Field(() => String, {
    nullable: true,
    description: 'Получатель',
  })
  recipient?: string;

  @Field(() => Float, {
    nullable: true,
    description: 'Количество голосов',
  })
  amount?: number;

  @Field(() => String, {
    nullable: true,
    description: 'Дата голосования',
  })
  voted_at?: string;
}
