import { Field, ObjectType } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';

/**
 * GraphQL объект для дельты блокчейна
 */
@ObjectType('Delta')
export class DeltaDTO {
  @Field(() => String, { description: 'Уникальный идентификатор' })
  id!: string;

  @Field(() => String, { description: 'ID блокчейна' })
  chain_id!: string;

  @Field(() => Number, { description: 'Номер блока' })
  block_num!: number;

  @Field(() => String, { description: 'ID блока' })
  block_id!: string;

  @Field(() => Boolean, { description: 'Флаг присутствия записи' })
  present!: boolean;

  @Field(() => String, { description: 'Код контракта' })
  code!: string;

  @Field(() => String, { description: 'Область действия' })
  scope!: string;

  @Field(() => String, { description: 'Имя таблицы' })
  table!: string;

  @Field(() => String, { description: 'Первичный ключ' })
  primary_key!: string;

  @Field(() => GraphQLJSON, { nullable: true, description: 'Данные записи в формате JSON' })
  value?: any;

  @Field(() => Date, { description: 'Дата создания' })
  created_at!: Date;
}
