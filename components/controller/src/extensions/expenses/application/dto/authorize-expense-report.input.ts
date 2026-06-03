import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ExpenseProposalDecisionSignedDocumentInputDTO } from '~/application/document/documents-dto/expense-proposal-decision-document.dto';

/**
 * Input авторизации СЗ-отчёта (председатель / совет утверждает закрытие сметы).
 *
 * Сабмит: `expense::authexp` через `ExpensesBlockchainPort.authExp`.
 * Подпись `decision` (registry 2011) сделана на стороне UI.
 *
 * После цепочки на-цепи: REPORT_SUBMITTED → CLOSED → `ExpensesCapitalTriggerService`
 * запускает capitalization Благороста (capital::createrid на сумму total_actual).
 */
@InputType('AuthorizeExpenseReportInput')
export class AuthorizeExpenseReportInputDTO {
  @Field(() => String, { description: 'Имя кооператива.' })
  @IsNotEmpty()
  @IsString()
  coopname!: string;

  @Field(() => String, { description: 'Хеш сметы расхода.' })
  @IsNotEmpty()
  @IsString()
  proposal_hash!: string;

  @Field(() => ExpenseProposalDecisionSignedDocumentInputDTO, {
    description: 'Подписанное решение совета (document2, registry 2011).',
  })
  @ValidateNested()
  @Type(() => ExpenseProposalDecisionSignedDocumentInputDTO)
  decision!: ExpenseProposalDecisionSignedDocumentInputDTO;
}
