import { ObjectType, Field, Int } from '@nestjs/graphql';
import { ProgramInvestStatus } from '../../../domain/enums/program-invest-status.enum';
import { DocumentAggregateDTO } from '~/application/document/dto/document-aggregate.dto';
import { BaseOutputDTO } from '~/shared/dto/base.dto';
/**
 * GraphQL Output DTO для сущности ProgramInvest
 */
@ObjectType('CapitalProgramInvest', {
  description: 'Программная инвестиция в системе CAPITAL',
})
export class ProgramInvestOutputDTO extends BaseOutputDTO {
  @Field(() => Int, {
    nullable: true,
    description: 'ID в блокчейне',
  })
  id?: number;

  @Field(() => Int, {
    nullable: true,
    description: 'Номер блока последнего обновления',
  })
  block_num?: number;

  @Field(() => Boolean, {
    description: 'Существует ли запись в блокчейне',
    defaultValue: false,
  })
  present!: boolean;

  @Field(() => ProgramInvestStatus, {
    description: 'Статус программной инвестиции',
  })
  status!: ProgramInvestStatus;

  @Field(() => String, {
    description: 'Хеш инвестиции',
  })
  invest_hash!: string;

  @Field(() => String, {
    nullable: true,
    description: 'Название кооператива',
  })
  coopname?: string;

  @Field(() => String, {
    nullable: true,
    description: 'Имя пользователя',
  })
  username?: string;

  @Field(() => String, {
    nullable: true,
    description: 'Статус из блокчейна',
  })
  blockchain_status?: string;

  @Field(() => String, {
    nullable: true,
    description: 'Дата инвестирования',
  })
  invested_at?: string;

  @Field(() => String, {
    nullable: true,
    description: 'Сумма инвестиции (asset из блокчейна, например «1000.0000 RUB»)',
  })
  amount?: string;

  @Field(() => DocumentAggregateDTO, {
    nullable: true,
    description: 'Заявление: агрегат (подписанный документ + при наличии сырой PDF из хранилища)',
  })
  statement?: DocumentAggregateDTO;
}
