import { ObjectType, Field, Int, Float } from '@nestjs/graphql';

/**
 * GraphQL Output DTO для сущности Vote
 */
@ObjectType('CapitalVote', {
  description: 'Голос в системе CAPITAL',
})
export class VoteOutputDTO {
  @Field(() => String, {
    description: 'Внутренний ID базы данных',
  })
  _id!: string;

  @Field(() => Int, {
    nullable: true,
    description: 'ID в блокчейне',
  })
  id?: number;

  @Field(() => Int, {
    nullable: true,
    description: 'Номер блока последнего обновления',
  })
  block_num?: number;

  @Field(() => Boolean, {
    description: 'Существует ли запись в блокчейне',
    defaultValue: false,
  })
  present!: boolean;

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
