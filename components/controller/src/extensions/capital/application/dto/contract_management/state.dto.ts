import { ObjectType, Field, Int, Float } from '@nestjs/graphql';

/**
 * GraphQL Output DTO для сущности State
 */
@ObjectType('CapitalState', {
  description: 'Состояние кооператива в системе CAPITAL',
})
export class StateOutputDTO {
  @Field(() => String, {
    description: 'Внутренний ID базы данных',
  })
  _id!: string;

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

  @Field(() => String, {
    description: 'Название кооператива',
  })
  coopname!: string;

  @Field(() => Float, {
    nullable: true,
    description: 'Глобальный доступный инвестиционный пул',
  })
  global_available_invest_pool?: number;

  @Field(() => Float, {
    nullable: true,
    description: 'Программное членство финансировано',
  })
  program_membership_funded?: number;

  @Field(() => Float, {
    nullable: true,
    description: 'Программное членство доступно',
  })
  program_membership_available?: number;

  @Field(() => Float, {
    nullable: true,
    description: 'Программное членство распределено',
  })
  program_membership_distributed?: number;

  @Field(() => Float, {
    nullable: true,
    description: 'Накопительная награда за акцию программного членства',
  })
  program_membership_cumulative_reward_per_share?: number;

  // TODO: Добавить поле config когда будет определена соответствующая структура данных
}
