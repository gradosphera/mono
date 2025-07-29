import { Field, ObjectType, Int, createUnionType } from '@nestjs/graphql';

/**
 * Базовый DTO для операции ledger
 */
@ObjectType('LedgerOperationBase')
abstract class LedgerOperationBaseDTO {
  @Field(() => Int, { description: 'Номер глобальной последовательности блокчейна' })
  global_sequence!: number;

  @Field(() => String, { description: 'Имя кооператива' })
  coopname!: string;

  @Field(() => String, { description: 'Тип операции' })
  action!: string;

  @Field(() => Date, { description: 'Дата и время создания операции' })
  created_at!: Date;
}

/**
 * DTO для операции пополнения счета (add)
 */
@ObjectType('LedgerAddOperation')
export class LedgerAddOperationDTO extends LedgerOperationBaseDTO {
  @Field(() => String, { description: 'Тип операции' })
  action!: 'add';

  @Field(() => Int, { description: 'ID счета' })
  account_id!: number;

  @Field(() => String, { description: 'Сумма операции' })
  quantity!: string;

  @Field(() => String, { description: 'Комментарий к операции' })
  comment!: string;
}

/**
 * DTO для операции списания со счета (sub)
 */
@ObjectType('LedgerSubOperation')
export class LedgerSubOperationDTO extends LedgerOperationBaseDTO {
  @Field(() => String, { description: 'Тип операции' })
  action!: 'sub';

  @Field(() => Int, { description: 'ID счета' })
  account_id!: number;

  @Field(() => String, { description: 'Сумма операции' })
  quantity!: string;

  @Field(() => String, { description: 'Комментарий к операции' })
  comment!: string;
}

/**
 * DTO для операции перевода между счетами (transfer)
 */
@ObjectType('LedgerTransferOperation')
export class LedgerTransferOperationDTO extends LedgerOperationBaseDTO {
  @Field(() => String, { description: 'Тип операции' })
  action!: 'transfer';

  @Field(() => Int, { description: 'ID счета отправителя' })
  from_account_id!: number;

  @Field(() => Int, { description: 'ID счета получателя' })
  to_account_id!: number;

  @Field(() => String, { description: 'Сумма операции' })
  quantity!: string;

  @Field(() => String, { description: 'Комментарий к операции' })
  comment!: string;
}

/**
 * DTO для операции блокировки средств (block)
 */
@ObjectType('LedgerBlockOperation')
export class LedgerBlockOperationDTO extends LedgerOperationBaseDTO {
  @Field(() => String, { description: 'Тип операции' })
  action!: 'block';

  @Field(() => Int, { description: 'ID счета' })
  account_id!: number;

  @Field(() => String, { description: 'Сумма операции' })
  quantity!: string;

  @Field(() => String, { description: 'Комментарий к операции' })
  comment!: string;
}

/**
 * DTO для операции разблокировки средств (unblock)
 */
@ObjectType('LedgerUnblockOperation')
export class LedgerUnblockOperationDTO extends LedgerOperationBaseDTO {
  @Field(() => String, { description: 'Тип операции' })
  action!: 'unblock';

  @Field(() => Int, { description: 'ID счета' })
  account_id!: number;

  @Field(() => String, { description: 'Сумма операции' })
  quantity!: string;

  @Field(() => String, { description: 'Комментарий к операции' })
  comment!: string;
}

/**
 * Union type для всех типов операций ledger
 */
export const LedgerOperationUnion = createUnionType({
  name: 'LedgerOperation',
  types: () => [
    LedgerAddOperationDTO,
    LedgerSubOperationDTO,
    LedgerTransferOperationDTO,
    LedgerBlockOperationDTO,
    LedgerUnblockOperationDTO,
  ],
  resolveType: (value) => {
    switch (value.action) {
      case 'add':
        return LedgerAddOperationDTO;
      case 'sub':
        return LedgerSubOperationDTO;
      case 'transfer':
        return LedgerTransferOperationDTO;
      case 'block':
        return LedgerBlockOperationDTO;
      case 'unblock':
        return LedgerUnblockOperationDTO;
      default:
        return null;
    }
  },
});

/**
 * DTO для ответа с историей операций ledger
 */
@ObjectType('LedgerHistoryResponse')
export class LedgerHistoryResponseDTO {
  @Field(() => [LedgerOperationUnion], { description: 'Список операций' })
  items!: (typeof LedgerOperationUnion)[];

  @Field(() => Int, { description: 'Общее количество операций' })
  totalCount!: number;

  @Field(() => Int, { description: 'Общее количество страниц' })
  totalPages!: number;

  @Field(() => Int, { description: 'Текущая страница' })
  currentPage!: number;
}
