import { Field, Int, InputType } from '@nestjs/graphql';
import { IsInt, IsString, MaxLength, MinLength, Matches, Min } from 'class-validator';

/**
 * Input для мутации `walmoveWallets` (operation `o.adj.walmove`).
 *
 * `quantity` — строка с символом, как в действии apply: `"100.0000 RUB"`.
 * Backend валидирует совместимость from_wallet/to_wallet с одним account_id
 * (через `Ledger2.LEDGER2_OPERATION_REGISTRY`) ДО подписания.
 */
@InputType('WalmoveInput')
export class WalmoveInputDTO {
  @Field(() => String)
  @IsString()
  coopname!: string;

  @Field(() => String, { description: 'Владелец кошельков (для коллективных — coopname)' })
  @IsString()
  username!: string;

  @Field(() => Int, { description: 'id кошелька-источника' })
  @IsInt()
  @Min(1)
  fromWallet!: number;

  @Field(() => Int, { description: 'id кошелька-приёмника' })
  @IsInt()
  @Min(1)
  toWallet!: number;

  @Field(() => String, { description: 'Сумма с символом, например "100.0000 RUB"' })
  @IsString()
  @Matches(/^\d+(\.\d+)?\s+[A-Z]{1,7}$/, { message: 'Формат "<amount> <SYMBOL>", например "100.0000 RUB"' })
  quantity!: string;

  @Field(() => String, { description: 'Обязательное обоснование корректировки' })
  @IsString()
  @MinLength(1, { message: 'memo обязателен — укажите обоснование корректировки' })
  @MaxLength(255)
  memo!: string;
}
