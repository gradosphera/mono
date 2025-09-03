import { ObjectType, Field } from '@nestjs/graphql';
import { ChartOfAccountsItemDTO } from './chart-of-accounts-item.dto';
import type { LedgerStateDomainInterface } from '~/domain/ledger/interfaces/ledger-state-domain.interface';

/**
 * DTO для полного состояния ledger кооператива
 */
@ObjectType('LedgerState')
export class LedgerStateDTO implements LedgerStateDomainInterface {
  @Field(() => String, {
    description: 'Имя кооператива',
  })
  coopname!: string;

  @Field(() => [ChartOfAccountsItemDTO], {
    description: 'План счетов с актуальными данными',
  })
  chartOfAccounts!: ChartOfAccountsItemDTO[];
}
