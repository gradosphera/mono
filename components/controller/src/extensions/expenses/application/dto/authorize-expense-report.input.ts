import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

/**
 * Input авторизации СЗ-отчёта (председатель / совет утверждает закрытие сметы).
 *
 * На-цепи: `expense::authexp` (terminal-переход REPORT_SUBMITTED → CLOSED).
 * Триггерит capital-trigger (`ExpensesCapitalTriggerService`) → capitalization
 * РИД-сегмента Благороста на сумму `total_actual` сметы.
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
}
