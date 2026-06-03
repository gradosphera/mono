import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

/**
 * Input создания СЗ-расхода (председатель / пайщик подаёт смету).
 *
 * На-цепи: `expense::createexp` (terminal-переход → CREATED).
 * Требует document2 `statement_doc` (type=2010) от signature-pipeline UI Эпика 2 —
 * остальные бизнес-поля (`operation_code`, `source_wallet`, `items`,
 * `callback`, `mechanics`) дойдут расширением DTO одновременно с подключением
 * document2. Сейчас регистрируется минимальная сигнатура, чтобы UI и SDK
 * видели mutation `createExpenseProposal` end-to-end.
 */
@InputType('CreateExpenseProposalInput')
export class CreateExpenseProposalInputDTO {
  @Field(() => String, { description: 'Имя кооператива.' })
  @IsNotEmpty()
  @IsString()
  coopname!: string;

  @Field(() => String, { description: 'Хеш сметы расхода (детерминированный, из UI).' })
  @IsNotEmpty()
  @IsString()
  proposal_hash!: string;
}
