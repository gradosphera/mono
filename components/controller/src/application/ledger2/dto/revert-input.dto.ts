import { Field, InputType } from '@nestjs/graphql';
import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

/**
 * Input для мутации `revertOperation` (operation `o.adj.rev`).
 *
 * Из UI приходит только `originalGlobalSequence` оригинальной apply-операции.
 * Backend поднимает её из БД blockchain_actions, готовит зеркальные параметры
 * (swap Dr/Cr, swap wallet_from/to, ISSUE → REVOKE) и подписывает action `revert`.
 *
 * Запрет на `o.mig.*` валидируется backend'ом ДО подписания и дублируется
 * eosio::check'ом в контракте.
 */
@InputType('RevertOperationInput')
export class RevertOperationInputDTO {
  @Field(() => String)
  @IsString()
  coopname!: string;

  @Field(() => String, {
    description:
      'global_sequence оригинальной apply-операции (Ledger2OperationDTO.globalSequence) — bigint в строке',
  })
  @IsString()
  @Matches(/^\d+$/, { message: 'originalGlobalSequence должен быть числом в строке' })
  originalGlobalSequence!: string;

  @Field(() => String, { description: 'Обязательное обоснование отката' })
  @IsString()
  @MinLength(1, { message: 'memo обязателен — укажите причину отката' })
  @MaxLength(255)
  memo!: string;
}
