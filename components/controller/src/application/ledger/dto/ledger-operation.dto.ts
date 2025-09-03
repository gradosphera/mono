import { Field, ObjectType, Int } from '@nestjs/graphql';

/**
 * DTO для операции ledger
 */
@ObjectType('LedgerOperation')
export class LedgerOperationDTO {
  @Field(() => Int, { description: 'Номер глобальной последовательности блокчейна' })
  global_sequence!: number;

  @Field(() => String, { description: 'Имя кооператива' })
  coopname!: string;

  @Field(() => String, { description: 'Тип операции' })
  action!: string;

  @Field(() => Date, { description: 'Дата и время создания операции' })
  created_at!: Date;

  @Field(() => Int, { description: 'ID счета' })
  account_id!: number;

  @Field(() => String, { description: 'Сумма операции' })
  quantity!: string;

  @Field(() => String, { description: 'Комментарий к операции', nullable: true })
  comment!: string;
}
/**
 * DTO для ответа с историей операций ledger
 */
@ObjectType('LedgerHistoryResponse')
export class LedgerHistoryResponseDTO {
  @Field(() => [LedgerOperationDTO], { description: 'Список операций' })
  items!: LedgerOperationDTO[];

  @Field(() => Int, { description: 'Общее количество операций' })
  totalCount!: number;

  @Field(() => Int, { description: 'Общее количество страниц' })
  totalPages!: number;

  @Field(() => Int, { description: 'Текущая страница' })
  currentPage!: number;
}
