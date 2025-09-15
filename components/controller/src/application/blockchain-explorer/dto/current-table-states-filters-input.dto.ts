import { Field, InputType } from '@nestjs/graphql';

/**
 * Входные фильтры для поиска текущих состояний таблиц
 */
@InputType('CurrentTableStatesFiltersInput')
export class CurrentTableStatesFiltersInputDTO {
  @Field(() => String, { nullable: true, description: 'Код контракта' })
  code?: string;

  @Field(() => String, { nullable: true, description: 'Область действия' })
  scope?: string;

  @Field(() => String, { nullable: true, description: 'Имя таблицы' })
  table?: string;
}
