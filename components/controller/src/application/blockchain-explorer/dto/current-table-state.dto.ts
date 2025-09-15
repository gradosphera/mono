import { Field, ObjectType } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';

/**
 * GraphQL объект для текущего состояния таблицы
 */
@ObjectType('CurrentTableState')
export class CurrentTableStateDTO {
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

  @Field(() => Number, { description: 'Номер блока, в котором была последняя запись' })
  block_num!: number;

  @Field(() => Date, { description: 'Дата создания последней записи' })
  created_at!: Date;
}
