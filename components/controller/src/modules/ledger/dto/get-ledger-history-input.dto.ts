import { Field, InputType, Int } from '@nestjs/graphql';
import { IsString, IsOptional, IsInt, Min, Max, IsIn } from 'class-validator';
import type { GetLedgerHistoryInputDomainInterface } from '~/domain/ledger/interfaces';

/**
 * DTO для получения истории операций ledger
 */
@InputType('GetLedgerHistoryInput')
export class GetLedgerHistoryInputDTO implements GetLedgerHistoryInputDomainInterface {
  @Field(() => String, { description: 'Имя кооператива' })
  @IsString()
  coopname!: string;

  @Field(() => Int, {
    nullable: true,
    description: 'ID счета для фильтрации. Если не указан, возвращаются операции по всем счетам',
  })
  @IsOptional()
  @IsInt()
  account_id?: number;

  @Field(() => Int, {
    nullable: true,
    description: 'Номер страницы (по умолчанию 1)',
    defaultValue: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @Field(() => Int, {
    nullable: true,
    description: 'Количество записей на странице (по умолчанию 10, максимум 100)',
    defaultValue: 10,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @Field(() => String, {
    nullable: true,
    description: 'Поле для сортировки (created_at, global_sequence)',
  })
  @IsOptional()
  @IsString()
  @IsIn(['created_at', 'global_sequence'])
  sortBy?: string;

  @Field(() => String, {
    nullable: true,
    description: 'Направление сортировки (ASC или DESC)',
    defaultValue: 'DESC',
  })
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC';
}
