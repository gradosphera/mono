import { ObjectType, Field, Int } from '@nestjs/graphql';
import type { ChartOfAccountsItemDomainInterface } from '~/domain/ledger/interfaces/chart-of-accounts-item-domain.interface';

/**
 * DTO для элемента плана счетов в GraphQL ответе
 */
@ObjectType('ChartOfAccountsItem')
export class ChartOfAccountsItemDTO implements ChartOfAccountsItemDomainInterface {
  @Field(() => Int, {
    description: 'Идентификатор счета',
  })
  id!: number;

  @Field(() => String, {
    description: 'Идентификатор счета для отображения (может быть дробным, например "86.6")',
  })
  displayId!: string;

  @Field(() => String, {
    description: 'Название счета',
  })
  name!: string;

  @Field(() => String, {
    description: 'Доступные средства',
  })
  available!: string;

  @Field(() => String, {
    description: 'Заблокированные средства',
  })
  blocked!: string;

  @Field(() => String, {
    description: 'Списанные средства',
  })
  writeoff!: string;
}
