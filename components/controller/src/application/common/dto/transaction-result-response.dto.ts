import { Field, ObjectType } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-type-json';

/**
 * DTO для результата транзакции.
 */
@ObjectType('Transaction')
export class TransactionDTO {
  @Field(() => GraphQLJSONObject, { description: 'Блокчейн, который использовался' })
  chain: any;

  @Field(() => GraphQLJSONObject, { description: 'Запрос на подписание транзакции' })
  request: any;

  @Field(() => GraphQLJSONObject, { description: 'Разрешенный запрос на подписание транзакции', nullable: true })
  resolved?: any;

  @Field(() => GraphQLJSONObject, {
    description: 'Ответ от API после отправки транзакции (если был выполнен бродкаст)',
    nullable: true,
  })
  response?: any;

  @Field(() => GraphQLJSONObject, { description: 'Возвращаемые значения после выполнения транзакции' })
  returns: any;

  @Field(() => GraphQLJSONObject, { description: 'Ревизии транзакции, измененные плагинами в ESR формате' })
  revisions: any;

  @Field(() => GraphQLJSONObject, { description: 'Подписи транзакции' })
  signatures: any;

  @Field(() => GraphQLJSONObject, { description: 'Авторизованный подписант' })
  signer: any;

  @Field(() => GraphQLJSONObject, { description: 'Итоговая транзакция', nullable: true })
  transaction?: any;
}
