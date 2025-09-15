import { Field, InputType } from '@nestjs/graphql';

/**
 * Входные фильтры для поиска действий
 */
@InputType('ActionFiltersInput')
export class ActionFiltersInputDTO {
  @Field(() => String, { nullable: true, description: 'Аккаунт отправителя' })
  account?: string;

  @Field(() => String, { nullable: true, description: 'Имя действия' })
  name?: string;

  @Field(() => Number, { nullable: true, description: 'Номер блока' })
  block_num?: number;

  @Field(() => String, { nullable: true, description: 'Глобальная последовательность' })
  global_sequence?: string;
}
