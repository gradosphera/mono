import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsNotEmpty } from 'class-validator';
import type { GetLedgerInputDomainInterface } from '~/domain/ledger/interfaces/get-ledger-input-domain.interface';

/**
 * DTO для входных данных запроса получения состояния ledger
 */
@InputType('GetLedgerInput')
export class GetLedgerInputDTO implements GetLedgerInputDomainInterface {
  @Field(() => String, {
    description: 'Имя кооператива для получения состояния ledger',
  })
  @IsString()
  @IsNotEmpty()
  coopname!: string;
}
