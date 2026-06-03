import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

/**
 * Input отклонения СЗ-отчёта (председатель / совет не утверждает закрытие).
 *
 * На-цепи: `expense::declineexp` (REPORT_SUBMITTED → DECLINED).
 * Capitalization Благороста НЕ запускается. Reason — обязательный, видимый в UI
 * и в audit log пайщика; до 1000 символов.
 */
@InputType('DeclineExpenseReportInput')
export class DeclineExpenseReportInputDTO {
  @Field(() => String, { description: 'Имя кооператива.' })
  @IsNotEmpty()
  @IsString()
  coopname!: string;

  @Field(() => String, { description: 'Хеш сметы расхода.' })
  @IsNotEmpty()
  @IsString()
  proposal_hash!: string;

  @Field(() => String, { description: 'Причина отклонения СЗ-отчёта (до 1000 символов).' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(1000)
  reason!: string;
}
