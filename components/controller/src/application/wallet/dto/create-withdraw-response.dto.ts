import { Field, ObjectType } from '@nestjs/graphql';

/**
 * DTO для ответа создания заявки на вывод средств
 */
@ObjectType('CreateWithdrawResponse')
export class CreateWithdrawResponseDTO {
  @Field(() => String, { description: 'Хеш созданной заявки на вывод' })
  withdraw_hash!: string;
}
