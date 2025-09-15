import { Field, InputType } from '@nestjs/graphql';

/**
 * Входные фильтры для поиска дельт
 */
@InputType('DeltaFiltersInput')
export class DeltaFiltersInputDTO {
  @Field(() => String, { nullable: true, description: 'Код контракта' })
  code?: string;

  @Field(() => String, { nullable: true, description: 'Область действия' })
  scope?: string;

  @Field(() => String, { nullable: true, description: 'Имя таблицы' })
  table?: string;

  @Field(() => Number, { nullable: true, description: 'Номер блока' })
  block_num?: number;

  @Field(() => String, { nullable: true, description: 'Первичный ключ' })
  primary_key?: string;

  @Field(() => Boolean, { nullable: true, description: 'Флаг присутствия записи' })
  present?: boolean;
}
